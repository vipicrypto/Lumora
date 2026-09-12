import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/prisma/db";
import { products } from "@/data/products";

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

/* ------------------------------------------------------------------
   Current User
------------------------------------------------------------------ */

async function getCurrentUser() {
  const cookieStore = await cookies();

  const userId =
    cookieStore.get("lumora_user_id")?.value;

  if (!userId) {
    return null;
  }

  const users =
    await db.orm.public.User.where({
      id: userId,
    }).all();

  return users[0] ?? null;
}

/* ------------------------------------------------------------------
   Admin Check
------------------------------------------------------------------ */

function isAdmin(user: any) {
  return user?.role === "ADMIN";
}

/* ------------------------------------------------------------------
   Safe Image
------------------------------------------------------------------ */

function getProductImages(
  value: unknown
): string[] {
  if (typeof value !== "string") {
    return [];
  }

  if (!value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string =>
          typeof item === "string" &&
          item.trim().length > 0
      );
    }
  } catch {
    // Legacy products store a single URL as plain text.
  }

  return [value.trim()];
}

function getPrimaryImage(
  value: unknown
): string {
  return getProductImages(value)[0] || "";
}

/* ------------------------------------------------------------------
   Deterministic Latest-First Sort
------------------------------------------------------------------ */

function sortOrdersLatestFirst(
  orders: any[]
) {
  orders.sort((a, b) => {
    const dateA =
      new Date(a.createdAt).getTime();

    const dateB =
      new Date(b.createdAt).getTime();

    const dateDifference =
      dateB - dateA;

    // Different timestamps
    if (dateDifference !== 0) {
      return dateDifference;
    }

    /*
     * Same timestamp:
     * use order ID as deterministic tie-breaker.
     */
    return String(b.id).localeCompare(
      String(a.id)
    );
  });

  return orders;
}

/* ------------------------------------------------------------------
   Format Orders
------------------------------------------------------------------ */

async function formatOrders(
  orders: any[],
  allOrderItems: any[]
) {
  /*
   * Load actual products from database.
   */
  const dbProducts =
    await db.orm.public.Product.all();

  /*
   * Product lookup by ID.
   */
  const productById =
    new Map<string, any>();

  /*
   * Product lookup by exact name.
   */
  const productByName =
    new Map<string, any>();

  for (const product of dbProducts) {
    if (product?.id) {
      productById.set(
        String(product.id),
        product
      );
    }

    if (product?.name) {
      productByName.set(
        String(product.name)
          .trim()
          .toLowerCase(),
        product
      );
    }
  }

  const formattedOrders =
    orders.map((order) => {
      /*
       * Get items belonging to this order.
       */
      const orderItems =
        allOrderItems.filter(
          (item) =>
            String(item.orderId) ===
            String(order.id)
        );

      const formattedItems =
        orderItems.map((item) => {
          /*
           * --------------------------------------------------------
           * Find actual DB product
           * --------------------------------------------------------
           */

          let dbProduct:
            | any
            | undefined;

          /*
           * 1. Find by productId.
           */
          if (item.productId) {
            dbProduct =
              productById.get(
                String(item.productId)
              );
          }

          /*
           * 2. Fallback by exact product name.
           */
          if (
            !dbProduct &&
            item.productName
          ) {
            dbProduct =
              productByName.get(
                String(item.productName)
                  .trim()
                  .toLowerCase()
              );
          }

          /*
           * 3. Legacy static product fallback.
           */
          const legacyProduct =
            products.find(
              (product) =>
                String(product.name)
                  .trim()
                  .toLowerCase() ===
                String(
                  item.productName
                )
                  .trim()
                  .toLowerCase()
            );

          /*
           * --------------------------------------------------------
           * Image
           *
           * DB image first.
           * Static product image second.
           * Empty if neither exists.
           *
           * No placeholder image.
           * --------------------------------------------------------
           */

          const dbImage =
            getPrimaryImage(
              dbProduct?.image
            );

          const legacyImage =
            getPrimaryImage(
              legacyProduct?.image
            );

          const productImage =
            dbImage ||
            legacyImage ||
            "";

          /*
           * Product ID.
           */
          const productId =
            dbProduct?.id ||
            item.productId ||
            legacyProduct?.id ||
            "";

          /*
           * Order item price.
           *
           * We use the price saved with the order,
           * not the current product price.
           */
          const price =
            Number(item.unitPrice) || 0;

          return {
            cartItemId:
              String(item.id),

            product: {
              id: String(productId),

              name: String(
                item.productName ||
                  dbProduct?.name ||
                  legacyProduct?.name ||
                  "Product"
              ),

              image: productImage,

              price,
            },

            quantity:
              Number(item.quantity) || 0,
          };
        });

      /*
       * Normalize createdAt.
       */
      let createdAt =
        new Date().toISOString();

      if (order.createdAt) {
        const date =
          new Date(order.createdAt);

        if (
          !Number.isNaN(
            date.getTime()
          )
        ) {
          createdAt =
            date.toISOString();
        }
      }

      return {
        id: String(order.id),

        createdAt,

        customer: {
          fullName: String(
            order.customerName || ""
          ),

          email: String(
            order.customerEmail || ""
          ),

          phone: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },

        delivery:
          "standard" as const,

        items: formattedItems,

        subtotal:
          Number(order.subtotal) || 0,

        shipping:
          Number(order.shipping) || 0,

        total:
          Number(order.total) || 0,

        status: String(
          order.status || "PENDING"
        ),

        paymentMethod:
          order.paymentMethod
            ? String(
                order.paymentMethod
              )
            : undefined,
      };
    });

  /*
   * ALWAYS latest order first.
   *
   * This is done after formatting so the final
   * response itself is deterministic.
   */
  return sortOrdersLatestFirst(
    formattedOrders
  );
}

/* ------------------------------------------------------------------
   GET /api/orders
------------------------------------------------------------------ */

export async function GET(
  request: Request
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please sign in to view your orders.",
        },
        { status: 401 }
      );
    }

    const url =
      new URL(request.url);

    const adminRequest =
      url.searchParams.get(
        "admin"
      ) === "true";

    /*
     * Load all order items once.
     */
    const allOrderItems =
      await db.orm.public.OrderItem.all();

    /* --------------------------------------------------------------
       ADMIN
    -------------------------------------------------------------- */

    if (adminRequest) {
      if (!isAdmin(user)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Admin access required.",
          },
          { status: 403 }
        );
      }

      const orders =
        await db.orm.public.Order.all();

      const formattedOrders =
        await formatOrders(
          orders,
          allOrderItems
        );

      return NextResponse.json({
        success: true,
        orders: formattedOrders,
      });
    }

    /* --------------------------------------------------------------
       CUSTOMER
    -------------------------------------------------------------- */

    const orders =
      await db.orm.public.Order.where({
        userId: user.id,
      }).all();

    const formattedOrders =
      await formatOrders(
        orders,
        allOrderItems
      );

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------
   PATCH /api/orders
   Admin only
------------------------------------------------------------------ */

export async function PATCH(
  request: Request
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please sign in.",
        },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Admin access required.",
        },
        { status: 403 }
      );
    }

    const body =
      await request.json();

    const orderId =
      String(
        body.orderId || ""
      ).trim();

    const status =
      String(
        body.status || ""
      )
        .trim()
        .toUpperCase();

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !VALID_STATUSES.includes(
        status as OrderStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const existingOrders =
      await db.orm.public.Order.where({
        id: orderId,
      }).all();

    const existingOrder =
      existingOrders[0];

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order not found.",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Order.where({
      id: orderId,
    }).updateAll({
      status:
        status as OrderStatus,
    });

    return NextResponse.json({
      success: true,

      order: {
        id: orderId,
        status,
      },
    });
  } catch (error) {
    console.error(
      "Update order error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------
   POST /api/orders
   Customer Checkout
------------------------------------------------------------------ */

export async function POST(
  request: Request
) {
  try {
    const cookieStore =
      await cookies();

    const userId =
      cookieStore.get(
        "lumora_user_id"
      )?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please sign in before placing an order.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const customer =
      body.customer ?? {};

    const items =
      Array.isArray(body.items)
        ? body.items
        : [];

    if (!items.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    const customerName =
      customer.name ||
      customer.fullName ||
      [
        customer.firstName,
        customer.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      "";

    const customerEmail =
      String(
        customer.email || ""
      )
        .trim()
        .toLowerCase();

    if (
      !customerName ||
      !customerEmail
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Customer name and email are required.",
        },
        { status: 400 }
      );
    }

    const subtotal =
      String(body.subtotal);

    const shipping =
      String(body.shipping);

    const total =
      String(body.total);

    if (
      !Number.isFinite(
        Number(subtotal)
      ) ||
      !Number.isFinite(
        Number(shipping)
      ) ||
      !Number.isFinite(
        Number(total)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid order totals.",
        },
        { status: 400 }
      );
    }

    /*
     * Create a unique order ID.
     */
    const orderId =
      String(
        body.id ||
          `LUM-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`
      );

    const paymentMethod =
      String(
        body.paymentMethod ||
          "COD"
      );

    /*
     * Create main order.
     */
    const order =
      await db.orm.public.Order.create(
        {
          id: orderId,

          userId,

          customerName,

          customerEmail,

          subtotal,

          shipping,

          total,

          paymentMethod,

          status: "PENDING",
        }
      );

    /*
     * Load DB products.
     */
    const activeProducts =
      await db.orm.public.Product.all();

    const activeProductIds =
      new Set(
        activeProducts
          .filter(
            (product) =>
              product.isActive
          )
          .map((product) =>
            String(product.id)
          )
      );

    /*
     * Product lookup by exact name.
     */
    const activeProductByName =
      new Map<string, any>();

    for (const product of activeProducts) {
      if (product?.name) {
        activeProductByName.set(
          String(product.name)
            .trim()
            .toLowerCase(),
          product
        );
      }
    }

    /*
     * Resolve actual DB Product ID.
     *
     * Priority:
     * 1. productId
     * 2. nested product.id
     * 3. exact product name
     */
    function resolveItemProductId(
      item: Record<
        string,
        unknown
      >
    ): string | null {
      const candidates: unknown[] =
        [
          item["productId"],
          item["product_id"],
        ];

      const nested =
        (item["product"] as
          | Record<
              string,
              unknown
            >
          | undefined) ??
        undefined;

      if (nested) {
        candidates.push(
          nested["id"],
          nested["productId"]
        );
      }

      /*
       * Try explicit IDs.
       */
      for (const candidate of candidates) {
        if (
          typeof candidate !==
          "string"
        ) {
          continue;
        }

        const trimmed =
          candidate.trim();

        if (
          trimmed &&
          activeProductIds.has(
            trimmed
          )
        ) {
          return trimmed;
        }
      }

      /*
       * Fallback to exact product name.
       */
      const possibleName =
        String(
          item["productName"] ||
            item["name"] ||
            nested?.["name"] ||
            ""
        )
          .trim()
          .toLowerCase();

      if (possibleName) {
        const matchedProduct =
          activeProductByName.get(
            possibleName
          );

        if (matchedProduct?.id) {
          return String(
            matchedProduct.id
          );
        }
      }

      return null;
    }

    /*
     * Create every OrderItem.
     */
    const createdItemIds: string[] =
      [];

    for (
      let index = 0;
      index < items.length;
      index += 1
    ) {
      const item =
        items[index] ?? {};

      const productName =
        String(
          item.productName ||
            item.name ||
            item.product?.name ||
            "Product"
        ).trim();

      const quantity =
        Number(item.quantity);

      const unitPriceNumber =
        Number(
          item.unitPrice ??
            item.price ??
            item.product?.price
        );

      const totalPriceNumber =
        Number(
          item.totalPrice ??
            unitPriceNumber *
              quantity
        );

      if (
        !productName ||
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0 ||
        !Number.isFinite(
          unitPriceNumber
        ) ||
        !Number.isFinite(
          totalPriceNumber
        )
      ) {
        throw new Error(
          `Invalid order item at position ${
            index + 1
          }: ${
            productName ||
            "Unknown product"
          }`
        );
      }

      const itemId =
        `${orderId}-ITEM-${index + 1}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      await db.orm.public.OrderItem.create(
        {
          id: itemId,

          orderId,

          productId:
            resolveItemProductId(
              item as Record<
                string,
                unknown
              >
            ),

          productName,

          quantity,

          unitPrice:
            String(
              unitPriceNumber
            ),

          totalPrice:
            String(
              totalPriceNumber
            ),
        }
      );

      createdItemIds.push(
        itemId
      );
    }

    /*
     * Verify order items were saved.
     */
    const persistedItems =
      await db.orm.public.OrderItem.all();

    const persistedItemCount =
      persistedItems.filter(
        (item) =>
          String(
            item.orderId
          ) === orderId
      ).length;

    if (
      persistedItemCount !==
      createdItemIds.length
    ) {
      throw new Error(
        `Order items were not fully saved. Expected ${createdItemIds.length}, saved ${persistedItemCount}.`
      );
    }

    return NextResponse.json({
      success: true,

      order: {
        id: order.id,

        userId:
          order.userId,

        customerName:
          order.customerName,

        customerEmail:
          order.customerEmail,

        subtotal:
          order.subtotal,

        shipping:
          order.shipping,

        total:
          order.total,

        paymentMethod:
          order.paymentMethod,

        status:
          order.status,
      },
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
