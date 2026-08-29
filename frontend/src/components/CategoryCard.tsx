import Image from "next/image";
import { Card } from "@/components/ui/Card";

/**
 * Card representing a product category with a background image and overlayed name.
 */
export const CategoryCard: React.FC<{ name: string; image: string }> = ({ name, image }) => {
  return (
    <Card hoverable className="relative overflow-hidden h-48">
      <Image src={image} alt={name} fill className="object-cover opacity-80" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h3 className="text-white text-xl font-semibold drop-shadow-lg">{name}</h3>
      </div>
    </Card>
  );
};
