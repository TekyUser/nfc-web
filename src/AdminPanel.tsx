import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function AdminPanel() {
  const [isAssigning, setIsAssigning] = useState(false);
  const [formData, setFormData] = useState({
    nfcId: "",
    holderName: "",
    holderEmail: "",
    holderPhone: "",
    department: "",
    position: "",
    employeeId: "",
  });

  const assignCard = useMutation(api.nfcCards.assignCard);
  const deactivateCard = useMutation(api.nfcCards.deactivateCard);
  const allCards = useQuery(api.nfcCards.listAllCards);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nfcId || !formData.holderName) {
      toast.error("NFC ID and Holder Name are required");
      return;
    }

    try {
      await assignCard({
        nfcId: formData.nfcId,
        holderName: formData.holderName,
        holderEmail: formData.holderEmail || undefined,
        holderPhone: formData.holderPhone || undefined,
        department: formData.department || undefined,
        position: formData.position || undefined,
        employeeId: formData.employeeId || undefined,
      });
      
      toast.success("NFC card assigned successfully!");
      setFormData({
        nfcId: "",
        holderName: "",
        holderEmail: "",
        holderPhone: "",
        department: "",
        position: "",
        employeeId: "",
      });
      setIsAssigning(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeactivate = async (cardId: string) => {
    if (confirm("Are you sure you want to deactivate this card?")) {
      try {
        await deactivateCard({ cardId: cardId as any });
        toast.success("Card deactivated successfully");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
          🔧 Admin Access
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <button
            onClick={() => setIsAssigning(!isAssigning)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors"
          >
            {isAssigning ? "Cancel" : "Assign New Card"}
          </button>
        </div>

        {isAssigning && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">NFC ID *</label>
              <input
                type="text"
                value={formData.nfcId}
                onChange={(e) => setFormData({ ...formData, nfcId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter NFC tag ID"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Holder Name *</label>
              <input
                type="text"
                value={formData.holderName}
                onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.holderEmail}
                onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.holderPhone}
                onChange={(e) => setFormData({ ...formData, holderPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+1234567890"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Engineering, HR, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Software Engineer, Manager, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="EMP001"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
            >
              Assign Card
            </button>
          </form>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4">Assigned Cards</h3>
          {allCards === undefined ? (
            <div className="text-center py-4">Loading...</div>
          ) : allCards.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No cards assigned yet</div>
          ) : (
            <div className="space-y-3">
              {allCards.map((card) => (
                <div key={card._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{card.holderName}</h4>
                      <p className="text-sm text-gray-600">NFC ID: {card.nfcId}</p>
                      {card.department && (
                        <p className="text-sm text-gray-600">{card.department}</p>
                      )}
                      {card.position && (
                        <p className="text-sm text-gray-600">{card.position}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Assigned: {new Date(card.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeactivate(card._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
