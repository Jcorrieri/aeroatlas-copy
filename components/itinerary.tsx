"use client"

import { useState } from "react"
import { Clock, MapPin, Plus, Edit, Trash, X, Check, AlertTriangle } from "lucide-react"
import TimePicker from 'react-time-picker'
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { Button } from "@/components/ui/button"
import { GeoapifyPlace } from "@/lib/geoapify";
import { useTheme } from "next-themes";
import {addPlaceToItinerary, deleteItineraryItem} from "@/lib/api-service";

interface ItineraryItem {
    id: number
    day: number
    time: string
    activity: string
    location: string
    duration: string
    place_id?: string
}

interface ItineraryProps {
    items: ItineraryItem[]
    onItemsChange?: () => void // Callback for when items change
}

// Character limits for text fields
const CHAR_LIMITS = {
    activity: 50,
    location: 90,
    duration: 20
}

export function Itinerary({ items: initialItems, onItemsChange }: ItineraryProps) {
    const [items, setItems] = useState<ItineraryItem[]>(initialItems)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [newItem, setNewItem] = useState<Omit<ItineraryItem, "id"> | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [editedItem, setEditedItem] = useState<ItineraryItem | null>(null)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const { theme } = useTheme()
    const isDark = theme === 'dark';

    // Find the next available ID
    const getNextId = () => {
        return Math.max(0, ...items.map((item) => item.id)) + 1
    }

    // Start editing an item
    const startEditing = (item: ItineraryItem) => {
        setEditingId(item.id)
        setEditedItem({ ...item })
        setNewItem(null)
        setDeletingId(null)
        setShowCancelConfirm(false)
    }

    // Try to cancel editing
    const tryCancelEditing = () => {
        // Check if there are changes
        if (editedItem && JSON.stringify(editedItem) !== JSON.stringify(items.find((item) => item.id === editedItem.id))) {
            setShowCancelConfirm(true)
        } else {
            cancelEditing()
        }
    }

    // Cancel editing
    const cancelEditing = () => {
        setEditingId(null)
        setEditedItem(null)
        setNewItem(null)
        setShowCancelConfirm(false)
        // Don't call onItemsChange here
    }

    // Update edited item (without closing the form)
    const updateEditedItem = (updatedFields: Partial<ItineraryItem>) => {
        if (editedItem) {
            setEditedItem({
                ...editedItem,
                ...updatedFields,
            })
        }
    }

    // Save edited item (when Done is clicked)
    const saveItem = () => {
        if (editedItem) {
            setItems(items.map((item) => (item.id === editedItem.id ? editedItem : item)))
            setEditingId(null)
            setEditedItem(null)
            setShowCancelConfirm(false)
            if (onItemsChange) onItemsChange()
        }
    }

    // Confirm delete
    const confirmDelete = (id: number) => {
        setDeletingId(id)
        setEditingId(null)
        setNewItem(null)
        setShowCancelConfirm(false)
    }

    // Cancel delete
    const cancelDelete = () => {
        setDeletingId(null)
    }

    const deleteItem = async () => {
        if (deletingId !== null) {
            // Get the item to be deleted (optional, for display/logging)
            const item = items.find((item) => item.id === deletingId);
            if (!item) return;

            // Get trip data from the URL
            const urlParams = new URLSearchParams(window.location.search);
            const tripData = {
                lat: urlParams.get("lat") || "",
                lon: urlParams.get("lon") || "",
                from: urlParams.get("from") || "",
                to: urlParams.get("to") || "",
                type: urlParams.get("type") || "vacation"
            };

            try {
                // Call the backend delete function
                const result = await deleteItineraryItem(item.place_id || '', tripData);

                // Update local state
                setItems((prev) => prev.filter((i) => i.id !== deletingId));
                setDeletingId(null);

                //  Notify parent or other components if needed
                if (onItemsChange) onItemsChange();
            } catch (error) {
                console.error("Failed to delete item:", error);
                alert("Failed to delete itinerary item. Please try again.");
            }
        }
    };

    // Start adding a new item
    const startAddingItem = () => {
        setNewItem({
            day: Math.max(...items.map((item) => item.day), 0) + 1,
            time: "12:00 PM",
            activity: "",
            location: "",
            duration: "1 hour",
        })
        setEditingId(null)
        setDeletingId(null)
        setShowCancelConfirm(false)
    }

    // Save new item
    const saveNewItem = async () => {
        if (newItem && newItem.activity.trim()) {
            const place: GeoapifyPlace = {
                geometry: { coordinates: [0, 0], type: "" },
                properties: {
                    place_id: `custom_${Date.now()}`,
                    name: newItem.activity,
                    formatted: newItem.location,
                    lat: 0,
                    lon: 0,
                    categories: ["custom"],
                }
            };

            const urlParams = new URLSearchParams(window.location.search);
            const tripData = {
                lat: urlParams.get("lat") || "",
                lon: urlParams.get("lon") || "",
                from: urlParams.get("from") || "",
                to: urlParams.get("to") || "",
                type: urlParams.get("type") || "vacation"
            };

            const details = {
                day: newItem.day,
                time: newItem.time,
                duration: newItem.duration
            };

            try {
                const result = await addPlaceToItinerary(place, tripData, details);

                if (result.success) {
                    setItems(result.itinerary);
                    setNewItem(null);
                    if (onItemsChange) onItemsChange();
                } else {
                    alert("Failed to add item: " + result.message);
                }
            } catch (error) {
                console.error("Error saving new itinerary item:", error);
                alert("Something went wrong while saving the item.");
            }
        } else {
            setNewItem(null);
        }
    };

    // Render character count
    const renderCharCount = (current: string, limit: number) => (
        <span className={`text-xs ${current.length > limit * 0.8 ? "text-yellow-400" : "text-gray-500"}`}>
      {current.length}/{limit}
    </span>
    )

    // Render edit form
    const renderEditForm = (item: ItineraryItem) => {
        if (!editedItem) return null

        if (showCancelConfirm) {
            return (
                <div className={`border-l-2 border-yellow-500 pl-4 pb-4 ${ isDark ? 'bg-gray-800' : 'bg-gray-300'} p-3 rounded`}>
                    <div className={`flex items-center ${ isDark ? 'text-yellow-400' : 'text-yellow-700'} mb-2`}>
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <p>Discard your changes?</p>
                    </div>
                    <p className="font-semibold mb-3">
                        Day {item.day}: {item.activity}
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setShowCancelConfirm(false)}>
                            Keep Editing
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 text-xs ${ isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-400'}`}
                            onClick={cancelEditing}
                        >
                            Discard
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className={`border-l-2 border-yellow-500 pl-4 pb-4 ${ isDark ? 'bg-gray-800' : 'bg-gray-400' } p-3 rounded`}>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Day</label>
                        <input
                            type="number"
                            value={editedItem.day}
                            onChange={(e) => updateEditedItem({ day: Number.parseInt(e.target.value) || 1 })}
                            className={`w-full ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                            min="1"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between">
                            <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Time</label>
                        </div>
                        <div>
                            <TimePicker
                                value={editedItem.time}
                                onChange={(e) => updateEditedItem({ time: e || '' })}
                                disableClock={true}
                                clearIcon={null}
                                format={"hh:mm a"}
                                className={`w-full ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                            />
                        </div>
                    </div>
                </div>
                <div className="mb-2">
                    <div className="flex justify-between">
                        <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Activity</label>
                        {renderCharCount(editedItem.activity, CHAR_LIMITS.activity)}
                    </div>
                    <input
                        type="text"
                        value={editedItem.activity}
                        onChange={(e) => updateEditedItem({ activity: e.target.value })}
                        className={`w-full ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                        maxLength={CHAR_LIMITS.activity}
                    />
                </div>
                <div className="mb-2">
                    <div className="flex justify-between">
                        <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Location</label>
                        {renderCharCount(editedItem.location, CHAR_LIMITS.location)}
                    </div>
                    <input
                        type="text"
                        value={editedItem.location}
                        onChange={(e) => updateEditedItem({ location: e.target.value })}
                        className={`w-full ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                        maxLength={CHAR_LIMITS.location}
                    />
                </div>
                <div className="mb-2">
                    <div className="flex justify-between">
                        <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Duration</label>
                        {renderCharCount(editedItem.duration, CHAR_LIMITS.duration)}
                    </div>
                    <input
                        type="text"
                        value={editedItem.duration}
                        onChange={(e) => updateEditedItem({ duration: e.target.value })}
                        className={`w-full ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                        maxLength={CHAR_LIMITS.duration}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 text-xs ${ isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-400'}`}
                        onClick={tryCancelEditing}
                    >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={saveItem}>
                        <Check className="w-4 h-4 mr-1" />
                        Done
                    </Button>
                </div>
            </div>
        )
    }

    // Render delete confirmation
    const renderDeleteConfirmation = (item: ItineraryItem) => (
        <div className={`border-l-2 border-red-500 pl-4 pb-4 ${ isDark ? 'bg-gray-800' : 'bg-gray-300'} p-3 rounded`}>
            <div className="flex items-center ${ isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`} mb-2">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <p>Are you sure you want to delete this activity?</p>
            </div>
            <p className="font-semibold mb-3">
                Day {item.day}: {item.activity}
            </p>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={cancelDelete}>
                    Cancel
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 text-xs ${ isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                    onClick={deleteItem}
                >
                    Delete
                </Button>
            </div>
        </div>
    )

    // Render new item form
    const renderNewItemForm = () => {
        if (!newItem) return null

        return (
            <div className={`border-l-2 border-green-500 pl-4 pb-4 ${ isDark ? 'bg-gray-800' : 'bg-gray-400' } p-3 rounded`}>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Day</label>
                        <input
                            type="number"
                            value={newItem.day}
                            onChange={(e) => setNewItem({ ...newItem, day: Number.parseInt(e.target.value) || 1 })}
                            className={`w-full ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                            min="1"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between">
                            <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Time</label>
                        </div>
                        <TimePicker
                            value={newItem.time}
                            onChange={(e) => setNewItem({...newItem ,time: e || '' })}
                            disableClock={true}
                            clearIcon={null} 
                            format={"hh:mm a"}
                            className={`w-full ${ isDark ? 'bg-gray-700 text-white dark-time-picker' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                        />
                    </div>
                </div>
                <div className="mb-2">
                    <div className="flex justify-between">
                        <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Activity</label>
                        {renderCharCount(newItem.activity, CHAR_LIMITS.activity)}
                    </div>
                    <input
                        type="text"
                        value={newItem.activity}
                        onChange={(e) => setNewItem({ ...newItem, activity: e.target.value })}
                        className={`w-full ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                        placeholder="Enter activity name"
                        maxLength={CHAR_LIMITS.activity}
                    />
                </div>
                <div className="mb-2">
                    <div className="flex justify-between">
                        <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Location</label>
                        {renderCharCount(newItem.location, CHAR_LIMITS.location)}
                    </div>
                    <input
                        type="text"
                        value={newItem.location}
                        onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                        className={`w-full ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                        placeholder="Enter location"
                        maxLength={CHAR_LIMITS.location}
                    />
                </div>
                <div className="mb-2">
                    <div className="flex justify-between">
                        <label className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-900'}`}>Duration</label>
                        {renderCharCount(newItem.duration, CHAR_LIMITS.duration)}
                    </div>
                    <input
                        type="text"
                        value={newItem.duration}
                        onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
                        className={`w-full ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'} p-1 rounded text-sm`}
                        placeholder="e.g. 2 hours"
                        maxLength={CHAR_LIMITS.duration}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 text-xs ${ isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-400'}`}
                        onClick={cancelEditing}
                    >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 text-xs ${ isDark ? 'text-green-400 hover:text-green-300' : 'text-green-700 hover:text-green-600'}`}
                        onClick={saveNewItem}
                    >
                        <Check className="w-4 h-4 mr-1" />
                        Add
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={`${isDark ? 'bg-gray-900 text-white' : 'bg-gray-200 text-black'} rounded-xl p-6`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-mono">Trip Itinerary</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-400'}`}
                    onClick={startAddingItem}
                    disabled={!!newItem || !!editingId || !!deletingId}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Activity
                </Button>
            </div>

            <div className="space-y-4">
                {items
                    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
                    .map((item) => (
                        <div key={item.id}>
                            {editingId === item.id ? (
                                renderEditForm(item)
                            ) : deletingId === item.id ? (
                                renderDeleteConfirmation(item)
                            ) : (
                                <div className="border-l-2 border-blue-500 pl-4 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg">
                                                Day {item.day}: {item.activity}
                                            </p>
                                            <p className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
                                                <MapPin className="w-4 h-4 mr-1" />
                                                {item.location}
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="flex items-center text-sm">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {item.time}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mr-2`}>{item.duration}</p>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => startEditing(item)}
                                                        disabled={!!editingId || !!deletingId}
                                                    >
                                                        <Edit className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => confirmDelete(item.id)}
                                                        disabled={!!editingId || !!deletingId}
                                                    >
                                                        <Trash className="w-4 h-4 text-red-400" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                {newItem && renderNewItemForm()}

                {items.length === 0 && !newItem && (
                    <div className="text-center py-6 text-gray-400">
                        <p>No activities planned yet.</p>
                        <p className="text-sm">Click "Add Activity" to start building your itinerary.</p>
                    </div>
                )}
            </div>
        </div>
    )
}