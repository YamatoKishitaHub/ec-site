export type Item = {
  id: number;
  attributes: {
    name: string;
    price: number;
    description: string;
    category: string;
    releaseDate: string;
    categories: {
      data: {
        id: number;
        attributes: {
          english: string;
          japanese: string;
          createdAt: string;
          updatedAt: string;
          publishedAt: string;
        };
      }[];
    };
    image: {
      data: {
        id: number;
        attributes: {
          alternativeText: null;
          caption: null;
          createdAt: string;
          ext: string;
          formats: {
            thumbnail: {
              ext: string;
              hash: string;
              height: number;
              mime: string;
              name: string;
              path: null;
              size: number;
              url: string;
              width: number;
            };
          };
          hash: string;
          height: number;
          mime: string;
          name: string;
          previewUrl: null;
          provider: string;
          provider_metadata: null;
          size: number;
          updatedAt: string;
          url: string;
          width: number;
        };
      }[];
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
};

export type Items = {
  data: Item[];
};

export type CartItem = Item & {
  quantity: number;
};

export type CartItems = CartItem[];
