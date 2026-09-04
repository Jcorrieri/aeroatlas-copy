"use client"

import type React from "react"

import { useState } from "react"
import { UsersRound, BriefcaseBusiness, TreePalm, CheckSquare, Square, Plus, Trash, X, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image";
import {useTheme} from "next-themes";

interface TravelRequirementsProps {
    tripType: string // 1-5, where 5 is the strongest
    requiredItems: string[]
    onItemsChange?: () => void // Callback for when items change
}

// Maximum number of items allowed in the checklist
const MAX_CHECKLIST_ITEMS = 10

export function TravelRequirements({
                                       tripType,
                                       requiredItems: initialItems,
                                       onItemsChange,
                                   }: TravelRequirementsProps) {
    const [items, setItems] = useState<string[]>(initialItems)
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
        initialItems.reduce((acc, item) => ({ ...acc, [item]: false }), {}),
    )
    const [newItem, setNewItem] = useState<string>("")
    const [isAddingItem, setIsAddingItem] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const { theme } = useTheme()
    const isDark = theme === 'dark';

    // Toggle item checked status
    const toggleItem = (item: string) => {
        setCheckedItems((prev) => ({
            ...prev,
            [item]: !prev[item],
        }))
        if (onItemsChange) onItemsChange()
    }

    // Confirm delete for an item
    const confirmDelete = (item: string) => {
        setItemToDelete(item)
    }

    // Cancel delete
    const cancelDelete = () => {
        setItemToDelete(null)
    }

    // Remove an item from the checklist
    const removeItem = (itemToRemove: string) => {
        setItems(items.filter((item) => item !== itemToRemove))

        // Also remove from checked items
        setCheckedItems((prev) => {
            const updated = { ...prev }
            delete updated[itemToRemove]
            return updated
        })

        setItemToDelete(null)
        if (onItemsChange) onItemsChange()
    }

    // Start adding a new item
    const startAddingItem = () => {
        setIsAddingItem(true)
        setNewItem("")
        setItemToDelete(null)
    }

    // Cancel adding a new item
    const cancelAddingItem = () => {
        setIsAddingItem(false)
        setNewItem("")
        // Don't call onItemsChange here
    }

    // Add a new item to the checklist
    const addNewItem = () => {
        if (newItem.trim()) {
            const trimmedItem = newItem.trim()

            // Only add if it doesn't already exist and we're under the limit
            if (!items.includes(trimmedItem) && items.length < MAX_CHECKLIST_ITEMS) {
                setItems([...items, trimmedItem])
                setCheckedItems((prev) => ({
                    ...prev,
                    [trimmedItem]: false,
                }))
                if (onItemsChange) onItemsChange()
            }

            setIsAddingItem(false)
            setNewItem("")
        }
    }

    // Handle key press in the input field
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            addNewItem()
        } else if (e.key === "Escape") {
            cancelAddingItem()
        }
    }

    const allChecked = Object.values(checkedItems).every(Boolean) && items.length > 0
    const someChecked = Object.values(checkedItems).some(Boolean)
    const checkedCount = Object.values(checkedItems).filter(Boolean).length
    const isAtMaxItems = items.length >= MAX_CHECKLIST_ITEMS

    // Render delete confirmation
    const renderDeleteConfirmation = (item: string) => (
        <div className={`p-2 ${ isDark ? 'bg-gray-800' : 'bg-gray-300'} rounded mb-2`}>
            <div className={`flex items-center ${ isDark ? 'text-red-400' : 'text-red-600'}`}>
                <AlertTriangle className="w-5 h-5 mr-2" />
                <p>Remove this item from your checklist?</p>
            </div>
            <p className="font-semibold mb-3">{item}</p>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={cancelDelete}>
                    Cancel
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 text-xs ${ isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                    onClick={() => removeItem(item)}
                >
                    Remove
                </Button>
            </div>
        </div>
    )

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-xl font-mono mb-2">Trip Type</h3>
                <div className="flex items-center">
                    {tripType === "Business"
                        ? <BriefcaseBusiness className={`w-10 h-10 text-green-500`} />
                        : tripType === "Family"
                            ? <UsersRound className={`w-10 h-10 text-green-500`} />
                            : tripType === "Personal"
                                ? <TreePalm className={`w-10 h-10 text-green-500`} />
                                : ""}
                </div>
                <p className="text-sm mt-1">
                    {tripType}
                </p>
            </div>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-mono">Packing Checklist</h3>
                    <p className="text-sm">
                        {allChecked ? "All packed!" : someChecked ? `${checkedCount}/${items.length} packed` : "Nothing packed yet"}
                    </p>
                </div>

                {/* Add new item form */}
                {isAddingItem && (
                    <div className={`mb-3 ${ isDark ? 'bg-gray-800' : 'bg-gray-300'} p-2 rounded`}>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Enter item to pack"
                                className={`flex-1 ${ isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'} p-1 rounded text-sm mr-2`}
                                autoFocus
                                maxLength={40}
                                onKeyDown={handleKeyPress}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 w-7 p-0 ${ isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-400'}`}
                                onClick={cancelAddingItem}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 w-7 p-0 ml-1 ${ isDark ? 'text-green-400 hover:text-green-300' : 'text-green-700 hover:text-green-600'}`}
                                onClick={addNewItem}
                                disabled={!newItem.trim()}
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className={`text-xs ${ isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{newItem.length}/40 characters</div>
                    </div>
                )}

                {/* Delete confirmation */}
                {itemToDelete && renderDeleteConfirmation(itemToDelete)}

                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className={`flex items-center justify-between ${ isDark ? 'hover:bg-gray-900 hover:text-white' : 'hover:bg-gray-200 hover:text-black'} p-1 rounded transition-colors group`}
                        >
                            <div className="flex items-center cursor-pointer flex-1" onClick={() => toggleItem(item)}>
                                {checkedItems[item] ? (
                                    <CheckSquare className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                                ) : (
                                    <Square className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
                                )}
                                <span className={checkedItems[item] ? "line-through text-gray-500" : ""}>{item}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => confirmDelete(item)}
                                disabled={!!itemToDelete}
                            >
                                <Trash className={`w-4 h-2 ${ isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`} />
                            </Button>
                        </li>
                    ))}
                </ul>

                {items.length === 0 && !itemToDelete && (
                    <div className={`text-center py-4 ${ isDark  ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>No items in your packing list.</p>
                        <p className="text-sm">Click "Add Item" to start building your checklist.</p>
                    </div>
                )}

                {/* Add button at the bottom */}
                {!isAddingItem && !itemToDelete && (
                    <div className="mt-3 text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`text-blue-600 ${isDark ? 'hover:text-blue-300' : 'hover:text-blue-500'}`}
                            onClick={startAddingItem}
                            disabled={isAtMaxItems}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Item {isAtMaxItems && "(Max 10)"}
                        </Button>
                        {isAtMaxItems && (
                            <p className="text-xs text-yellow-400 mt-1">
                                Maximum of 10 items reached. Remove an item to add a new one.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}