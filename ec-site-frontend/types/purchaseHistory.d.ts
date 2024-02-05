export type PurchaseHistory = {
  id: number;
  attributes: {
    userId: number;
    itemId: number;
    quantity: number;
    purchaseDatetime: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
};

export type PurchaseHistories = {
  data: PurchaseHistory[];
};
