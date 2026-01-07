export enum CartStatus {
	Open = "open",
	Closed = "closed",
}

export type CartProduct = {
	productId: string
	quantity: number
	price: number
}