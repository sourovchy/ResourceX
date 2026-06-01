import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";

export interface SelectOption {
	value: string;
	label: React.ReactNode;
}

export interface SelectProps {
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	error?: boolean;
	className?: string;
	required?: boolean;
}

export function Select({
	options,
	value,
	onChange,
	placeholder = "Select an option",
	disabled = false,
	error = false,
	className = "",
	required = false,
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
	const listboxRef = useRef<HTMLUListElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	// Sync focused index with selected option when opening
	useEffect(() => {
		if (isOpen) {
			const index = options.findIndex((opt) => opt.value === value);
			setFocusedIndex(index >= 0 ? index : 0);
		}
	}, [isOpen, options, value]);

	// Scroll focused option into view
	useEffect(() => {
		if (isOpen && focusedIndex >= 0 && listboxRef.current) {
			const activeElement = listboxRef.current.children[
				focusedIndex
			] as HTMLElement;
			if (activeElement) {
				activeElement.scrollIntoView({
					block: "nearest",
				});
			}
		}
	}, [focusedIndex, isOpen]);

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (disabled) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
				} else {
					setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
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
			case " ":
				e.preventDefault();
				if (isOpen) {
					if (focusedIndex >= 0 && focusedIndex < options.length) {
						onChange(options[focusedIndex].value);
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
				aria-controls="select-listbox"
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
				<div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-borderLight bg-popover shadow-lg animate-in fade-in zoom-in-95 duration-100">
					<ul
						ref={listboxRef}
						role="listbox"
						id="select-listbox"
						className="max-h-60 overflow-y-auto p-1 py-1.5 focus:outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						{options.map((option, index) => {
							const isSelected = option.value === value;
							const isFocused = index === focusedIndex;

							return (
								<li
									key={option.value}
									role="option"
									aria-selected={isSelected}
									onClick={() => handleSelect(option.value)}
									onMouseEnter={() => setFocusedIndex(index)}
									className={`relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm transition-colors
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
						})}
					</ul>
				</div>
			)}
		</div>
	);
}
