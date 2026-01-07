export enum CartStatus {
	Open = "open",
	Closed = "closed",
}

export type CartProduct = {
	product_id: string
	quantity: number
	price: number
}