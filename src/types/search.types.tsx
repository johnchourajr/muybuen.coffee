"use client";
import { ScoredBusiness } from "@/lib/coffee-shop-scoring";

export type Business = {
  alias: string;
  buentag: string;
  categories: any;
  coordinates: any;
  display_phone: string;
  distance: number;
  id: string;
  image_url: string;
  is_closed: boolean;
  location: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    country: string;
    display_address: string[];
    state: string;
    zip_code: string;
  };
  name: string;
  phone: string;
  price: string;
  rating: number;
  review_count: number;
  transactions: any;
  url: string;
};
export type SearchResult = {
  data: ScoredBusiness[];
};
