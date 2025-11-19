export interface CampaignData {
  name: string;
  platform: string;
  selectedDays: string[];
  timeSlots: Record<string, string[]>;
}

export interface CampaignDaypartingFormProps {
  campaignData: CampaignData;
  setCampaignData: React.Dispatch<React.SetStateAction<CampaignData>>;
  onSubmit: () => void;
  isHumanInTheLoop?: boolean;
}

export interface LineGraphWidgetProps {
  data: any;
  status: string;
}
