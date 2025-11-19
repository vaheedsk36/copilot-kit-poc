import React from 'react';
import type { CampaignDaypartingFormProps } from './types';

const CampaignDaypartingForm: React.FC<CampaignDaypartingFormProps> = ({
  campaignData,
  setCampaignData,
  onSubmit,
  isHumanInTheLoop = false
}) => {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeSlots = ['00:00-06:00', '06:00-12:00', '12:00-18:00', '18:00-24:00'];

  const handleDayToggle = (day: string) => {
    setCampaignData(prev => {
      const selectedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day];

      // Initialize time slots for newly selected days
      const timeSlots = { ...prev.timeSlots };
      if (!timeSlots[day]) {
        timeSlots[day] = [];
      }

      return { ...prev, selectedDays, timeSlots };
    });
  };

  const handleTimeSlotToggle = (day: string, slot: string) => {
    setCampaignData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [day]: prev.timeSlots[day]?.includes(slot)
          ? prev.timeSlots[day].filter(s => s !== slot)
          : [...(prev.timeSlots[day] || []), slot]
      }
    }));
  };

  const handleSubmit = () => {
    if (!campaignData.name.trim()) {
      alert("Please enter a campaign name");
      return;
    }
    if (campaignData.selectedDays.length === 0) {
      alert("Please select at least one day");
      return;
    }

    // Check if at least one day has time slots selected
    const hasTimeSlots = campaignData.selectedDays.some(day =>
      campaignData.timeSlots[day]?.length > 0
    );

    if (!hasTimeSlots) {
      alert("Please select at least one time slot for your selected days");
      return;
    }

    onSubmit();
  };

  return (
    <div className={`p-6 border rounded max-w-2xl mx-auto ${isHumanInTheLoop ? 'bg-blue-50' : 'bg-green-50'}`}>
      <h3 className="font-bold mb-4 text-lg">
        🎯 Campaign Dayparting Setup{isHumanInTheLoop ? ' (Human-in-the-Loop)' : ''}
      </h3>

      <div className="space-y-6">
        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Campaign Name:</label>
          <input
            type="text"
            value={campaignData.name}
            onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
            placeholder="Enter campaign name"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Platform:</label>
          <select
            value={campaignData.platform}
            onChange={(e) => setCampaignData({...campaignData, platform: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="amazon">Amazon</option>
            <option value="flipkart">Flipkart</option>
            <option value="myntra">Myntra</option>
            <option value="ajio">Ajio</option>
            <option value="nykaa">Nykaa</option>
            <option value="bigbasket">BigBasket</option>
          </select>
        </div>

        {/* Days Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Select Days:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {daysOfWeek.map(day => (
              <label key={day} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campaignData.selectedDays.includes(day)}
                  onChange={() => handleDayToggle(day)}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium capitalize">{day}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Slots for Selected Days */}
        {campaignData.selectedDays.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-3">Time Slots for Selected Days:</label>
            {campaignData.selectedDays.map(day => (
              <div key={day} className="mb-4 p-4 border rounded-lg bg-white">
                <h4 className="font-medium capitalize mb-3 text-blue-700">{day}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map(slot => (
                    <label key={slot} className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={campaignData.timeSlots[day]?.includes(slot) || false}
                        onChange={() => handleTimeSlotToggle(day, slot)}
                        className="mr-2 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm">{slot}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Add Campaign{isHumanInTheLoop ? ' (Human-in-the-Loop)' : ''}
        </button>
      </div>
    </div>
  );
};

export default CampaignDaypartingForm;
