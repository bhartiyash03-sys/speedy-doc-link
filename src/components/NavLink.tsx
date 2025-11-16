import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ to, children, className }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "text-foreground/80 hover:text-foreground transition-colors",
        className
      )}
    >
      {children}
    </Link>
  );
};

export { NavLink };
export default NavLink;
