export type Category = {
  id: number;
  attributes: {
    english: string;
    japanese: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
};

export type Categories = {
  data: Category[];
};
