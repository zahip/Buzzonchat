import React from "react";

export default function OptimizationDialog({
  open,
  onOpenChange,
  optimizationSettings,
  setOptimizationSettings,
  isOptimizing,
  showPrompt,
  setShowPrompt,
  generatedPrompt,
  setGeneratedPrompt,
  generateOptimizationPrompt,
  handleRunOptimization,
  productTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optimizationSettings: any;
  setOptimizationSettings: (settings: any) => void;
  isOptimizing: boolean;
  showPrompt: boolean;
  setShowPrompt: (show: boolean) => void;
  generatedPrompt: string;
  setGeneratedPrompt: (prompt: string) => void;
  generateOptimizationPrompt: () => string;
  handleRunOptimization: () => void;
  productTitle: string;
}) {
  return (
    open && (
      <dialog
        open
        className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg border shadow-lg p-6 bg-white z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <form method="dialog" className="space-y-6">
          <div className="flex items-center gap-2 text-xl font-bold mb-2">
            <span>⚙️</span>
            הגדרות אופטימיזציה
          </div>
          <div className="text-gray-500 mb-4">
            התאם את הגדרות האופטימיזציה עבור המוצר "{productTitle}"
          </div>
          {/* גוון קול */}
          <div className="space-y-2">
            <label>גוון קול</label>
            <select
              value={optimizationSettings.tone}
              onChange={(e) =>
                setOptimizationSettings({
                  ...optimizationSettings,
                  tone: e.target.value,
                })
              }
              className="w-full border rounded p-2"
            >
              <option value="professional">מקצועי ועניני</option>
              <option value="friendly">ידידותי ונגיש</option>
              <option value="marketing">שיווקי ומושך</option>
              <option value="technical">טכני ומפורט</option>
            </select>
          </div>
          {/* קהל יעד */}
          <div className="space-y-2">
            <label>קהל יעד</label>
            <input
              type="text"
              placeholder="למשל: צעירים, מקצועיות, משפחות וכו'"
              value={optimizationSettings.target_audience}
              onChange={(e) =>
                setOptimizationSettings({
                  ...optimizationSettings,
                  target_audience: e.target.value,
                })
              }
              className="w-full border rounded p-2"
            />
          </div>
          {/* רמת פירוט */}
          <div className="space-y-2">
            <label>רמת פירוט</label>
            <select
              value={optimizationSettings.detail_level}
              onChange={(e) =>
                setOptimizationSettings({
                  ...optimizationSettings,
                  detail_level: e.target.value,
                })
              }
              className="w-full border rounded p-2"
            >
              <option value="short">קצר וחד</option>
              <option value="medium">בינוני ומאוזן</option>
              <option value="detailed">מפורט ועשיר</option>
            </select>
          </div>
          {/* מילות מפתח נוספות */}
          <div className="space-y-2">
            <label>מילות מפתח נוספות לשילוב</label>
            <textarea
              placeholder="הכנס מילות מפתח שתרצה שה-AI יכלול (מופרדות בפסיקים)"
              value={optimizationSettings.additional_keywords}
              onChange={(e) =>
                setOptimizationSettings({
                  ...optimizationSettings,
                  additional_keywords: e.target.value,
                })
              }
              rows={3}
              className="w-full border rounded p-2"
            />
          </div>
          {/* שטחי מיקוד */}
          <div className="space-y-2">
            <label>מה לשפר?</label>
            <div className="space-y-2">
              {[
                { id: "title", label: "כותרת המוצר" },
                { id: "description", label: "תיאור המוצר" },
                { id: "tags", label: "תגיות המוצר" },
              ].map((area) => (
                <div key={area.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={area.id}
                    checked={optimizationSettings.focus_areas.includes(area.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOptimizationSettings({
                          ...optimizationSettings,
                          focus_areas: [
                            ...optimizationSettings.focus_areas,
                            area.id,
                          ],
                        });
                      } else {
                        setOptimizationSettings({
                          ...optimizationSettings,
                          focus_areas: optimizationSettings.focus_areas.filter(
                            (id: string) => id !== area.id,
                          ),
                        });
                      }
                    }}
                  />
                  <label htmlFor={area.id}>{area.label}</label>
                </div>
              ))}
            </div>
          </div>
          {/* הצגת פרומפט */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label>צפה בפרומפט שיישלח ל-AI</label>
              <button
                type="button"
                className="border rounded px-2 py-1 text-sm"
                onClick={() => {
                  setGeneratedPrompt(generateOptimizationPrompt());
                  setShowPrompt(!showPrompt);
                }}
              >
                📋 {showPrompt ? "הסתר פרומפט" : "הצג פרומפט"}
              </button>
            </div>
            {showPrompt && (
              <div className="bg-gray-50 p-4 rounded-lg border max-h-60 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap text-gray-700">
                  {generatedPrompt}
                </pre>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-6 justify-end">
            <button
              type="button"
              className="border rounded px-4 py-2"
              onClick={() => onOpenChange(false)}
              disabled={isOptimizing}
            >
              ביטול
            </button>
            <button
              type="button"
              className="bg-green-600 text-white rounded px-4 py-2 flex items-center gap-2"
              onClick={handleRunOptimization}
              disabled={
                isOptimizing || optimizationSettings.focus_areas.length === 0
              }
            >
              {isOptimizing ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>⚡</span>
              )}
              הפעל אופטימיזציה
            </button>
          </div>
        </form>
      </dialog>
    )
  );
}
