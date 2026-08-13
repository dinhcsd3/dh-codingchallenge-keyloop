export interface ActionLog {
  id: string;
  vehicleId: string;
  action: string;
  notes: string;
  timestamp: string;
  user: string;
  proposedDate?: string;
}

export type ActionType =
  | 'Price Reduction'
  | 'Trade-In Offer'
  | 'Auction Listing'
  | 'Marketing Campaign'
  | 'Internal Transfer'
  | 'Special Promotion'
  | 'Other';
