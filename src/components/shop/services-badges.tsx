"use client";

interface ServicesBadgesProps {
  transactions?: string[];
}

export const ServicesBadges = ({ transactions }: ServicesBadgesProps) => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {transactions.map((transaction: string) => (
        <span
          key={transaction}
          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm capitalize"
        >
          {transaction === "delivery" && ""}
          {transaction === "pickup" && ""}
          {transaction}
        </span>
      ))}
    </div>
  );
};
