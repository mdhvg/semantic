import { DocumentSchema } from '$shared/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function defaultDocument(id: number): DocumentSchema {
	return {
		document_id: id,
		title: '',
		mime: 'text/plain',
		deleted: false,
		deleted_time_left: 0
	}
}
