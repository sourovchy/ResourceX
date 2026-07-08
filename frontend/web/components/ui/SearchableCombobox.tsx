import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";

export interface ComboboxOption {
	value: string;
	label: React.ReactNode;
	// Used for text filtering
	searchText?: string;
}

export interface SearchableComboboxProps {
	options: ComboboxOption[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	disabled?: boolean;
	error?: boolean;
	className?: string;
	required?: boolean;
	loading?: boolean;
	emptyState?: React.ReactNode;
}

export function SearchableCombobox({
	options,
	value,
	onChange,
	placeholder = "Select an option",
	searchPlaceholder = "Search...",
	disabled = false,
	error = false,
	className = "",
	required = false,
	loading = false,
	emptyState = "No results found.",
}: SearchableComboboxProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [focusedIndex, setFocusedIndex] = useState(-1);
	
	const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
	const listboxRef = useRef<HTMLUListElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	// Filter options
	const filteredOptions = options.filter((opt) => {
		const searchTarget = (opt.searchText || (typeof opt.label === 'string' ? opt.label : opt.value)).toLowerCase();
		return searchTarget.includes(searchQuery.toLowerCase());
	});

	// Reset search and focus when closing
	useEffect(() => {
		if (!isOpen) {
			setSearchQuery("");
			setFocusedIndex(-1);
		} else {
			// Auto focus input
			setTimeout(() => {
				if (inputRef.current) inputRef.current.focus();
			}, 50);
			
			// Set focused index to selected item if exists in filtered list
			const index = filteredOptions.findIndex((opt) => opt.value === value);
			setFocusedIndex(index >= 0 ? index : 0);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	// Scroll focused option into view
	useEffect(() => {
		if (isOpen && focusedIndex >= 0 && listboxRef.current && listboxRef.current.children.length > focusedIndex) {
			const activeElement = listboxRef.current.children[
				focusedIndex
			] as HTMLElement;
			if (activeElement) {
				activeElement.scrollIntoView({
					block: "nearest",
				});
			}
		}
	}, [focusedIndex, isOpen, filteredOptions.length]);

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (disabled) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
				} else {
					setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
				}
				break;
			case "ArrowUp":
				e.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
				} else {
					setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
				}
				break;
			case "Enter":
				e.preventDefault();
				if (isOpen) {
					if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
						onChange(filteredOptions[focusedIndex].value);
						setIsOpen(false);
					}
				} else {
					setIsOpen(true);
				}
				break;
			case "Escape":
				e.preventDefault();
				setIsOpen(false);
				break;
			case "Tab":
				setIsOpen(false);
				break;
		}
	};

	const toggleOpen = () => {
		if (!disabled) setIsOpen(!isOpen);
	};

	const handleSelect = (val: string) => {
		onChange(val);
		setIsOpen(false);
	};

	return (
		<div
			className={`relative w-full ${className}`}
			ref={containerRef}
			onKeyDown={handleKeyDown}
		>
			{/* Hidden native input for required validation */}
			{required && (
				<input
					type="text"
					value={value}
					onChange={() => {}}
					className="absolute h-0 w-0 opacity-0"
					required
					tabIndex={-1}
					aria-hidden="true"
				/>
			)}

			<div
				role="combobox"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-controls="combobox-listbox"
				aria-disabled={disabled}
				tabIndex={disabled ? -1 : 0}
				onClick={toggleOpen}
				className={`flex w-full items-center justify-between rounded-xl border bg-surface px-4 py-3 text-sm transition-colors outline-none
					${disabled ? "cursor-not-allowed opacity-60 bg-surfaceVariant" : "cursor-pointer"}
					${
						error
							? "border-error focus:ring-1 focus:ring-error"
							: "border-borderLight hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary"
					}
				`}
			>
				<span
					className={`block truncate ${!selectedOption ? "text-textSecondary" : "text-textPrimary"}`}
				>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					className={`h-4 w-4 shrink-0 text-textSecondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
				/>
			</div>

			{isOpen && (
				<div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl glass-surface shadow-2xl border border-borderLight/60 animate-in fade-in zoom-in-95 duration-100 flex flex-col">
					{/* Search Header */}
					<div className="flex items-center border-b border-borderLight px-3 py-2 bg-popover">
						<Search className="h-4 w-4 text-textSecondary mr-2 shrink-0" />
						<input
							ref={inputRef}
							type="text"
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setFocusedIndex(0);
							}}
							placeholder={searchPlaceholder}
							className="flex-1 bg-transparent text-sm text-textPrimary outline-none placeholder:text-textTertiary"
							onClick={(e) => e.stopPropagation()}
						/>
						{searchQuery && (
							<button 
								onClick={(e) => {
									e.stopPropagation();
									setSearchQuery("");
									inputRef.current?.focus();
								}}
								className="text-textTertiary hover:text-textPrimary transition-colors"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					{/* Options List */}
					<ul
						ref={listboxRef}
						role="listbox"
						id="combobox-listbox"
						className="max-h-60 overflow-y-auto p-1 py-1.5 focus:outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						{loading ? (
							<div className="px-4 py-3 text-sm text-textSecondary text-center">
								Loading...
							</div>
						) : filteredOptions.length === 0 ? (
							<div className="px-4 py-3 text-sm text-textSecondary text-center">
								{emptyState}
							</div>
						) : (
							filteredOptions.map((option, index) => {
								const isSelected = option.value === value;
								const isFocused = index === focusedIndex;

								return (
									<li
										key={option.value}
										role="option"
										aria-selected={isSelected}
										onClick={() => handleSelect(option.value)}
										onMouseEnter={() => setFocusedIndex(index)}
										className={`relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm transition-all duration-150 ease-out hover:scale-[1.015] active:scale-[0.99]
											${isSelected ? "text-primary font-bold bg-primary/10" : ""}
											${isFocused && !isSelected ? "bg-primary text-white" : ""}
											${!isSelected && !isFocused ? "text-textPrimary hover:bg-primary hover:text-white" : ""}
										`}
									>
										<span className="block truncate mr-6 flex-1">
											{option.label}
										</span>
										{isSelected && (
											<span className={`absolute right-3 flex items-center ${isFocused ? "text-white" : "text-primary"}`}>
												<Check className="h-4 w-4" />
											</span>
										)}
									</li>
								);
							})
						)}
					</ul>
				</div>
			)}
		</div>
	);
}
