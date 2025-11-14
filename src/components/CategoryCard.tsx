import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  count: number;
  onClick: () => void;
}

export const CategoryCard = ({ icon: Icon, title, count, onClick }: CategoryCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="p-6 cursor-pointer transition-all duration-300 hover:shadow-medium hover:-translate-y-1 bg-card border-border"
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="p-4 rounded-full bg-secondary">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{count}+ doctors</p>
        </div>
      </div>
    </Card>
  );
};
