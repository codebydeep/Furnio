import prisma from '../db/prisma.js'

export async function getAllProducts(req, res) {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(products)
  } catch (err) {
    console.error('[getAllProducts]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getProductById(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product ID.' })

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    return res.status(200).json(product)
  } catch (err) {
    console.error('[getProductById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createProduct(req, res) {
  try {
    const { name, type, salesPrice, costPrice, category } = req.body
    const product = await prisma.product.create({ data: { name, type, salesPrice, costPrice, category } })
    return res.status(201).json({ message: 'Product created successfully.', product })
  } catch (err) {
    console.error('[createProduct]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product ID.' })

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Product not found.' })

    const { name, type, salesPrice, costPrice, category } = req.body
    const data = {}
    if (name       !== undefined) data.name       = name
    if (type       !== undefined) data.type       = type
    if (salesPrice !== undefined) data.salesPrice = salesPrice
    if (costPrice  !== undefined) data.costPrice  = costPrice
    if (category   !== undefined) data.category   = category

    const product = await prisma.product.update({ where: { id }, data })
    return res.status(200).json({ message: 'Product updated successfully.', product })
  } catch (err) {
    console.error('[updateProduct]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function deleteProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product ID.' })

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Product not found.' })

    await prisma.product.delete({ where: { id } })
    return res.status(200).json({ message: 'Product deleted successfully.' })
  } catch (err) {
    console.error('[deleteProduct]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
