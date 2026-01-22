export type SmartScanMatch = {
  car_id: string;
  confidence: number;
  match_type?: string;
  car?: Record<string, any>;
};

export type SmartScanResult = {
  extracted_data?: Record<string, any>;
  match_result?: {
    confidence?: number;
    confidence_tier?: string;
    matches?: SmartScanMatch[];
    summary?: Record<string, any>;
  };
  images?: {
    front_url?: string;
    back_url?: string;
  };
};
