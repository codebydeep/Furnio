import db from '../libs/db.js'

export async function getAllProducts(req, res) {
  try {
    const { archived } = req.query
    const where = archived === 'true' ? {} : { archived: false }
    const products = await db.product.findMany({ where, orderBy: { createdAt: 'desc' } })
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
    const product = await db.product.findUnique({ where: { id } })
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    return res.status(200).json(product)
  } catch (err) {
    console.error('[getProductById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function createProduct(req, res) {
  try {
    const { name, type, salesPrice, cost, category } = req.body
    const product = await db.product.create({ data: { name, type, salesPrice, cost, category: category ?? null } })
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
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Product not found.' })

    const { name, type, salesPrice, cost, category } = req.body
    const data = {}
    if (name       !== undefined) data.name       = name
    if (type       !== undefined) data.type       = type
    if (salesPrice !== undefined) data.salesPrice = salesPrice
    if (cost       !== undefined) data.cost       = cost
    if (category   !== undefined) data.category   = category

    const product = await db.product.update({ where: { id }, data })
    return res.status(200).json({ message: 'Product updated successfully.', product })
  } catch (err) {
    console.error('[updateProduct]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function archiveProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product ID.' })
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Product not found.' })

    const product = await db.product.update({ where: { id }, data: { archived: !existing.archived } })
    return res.status(200).json({
      message: product.archived ? 'Product archived.' : 'Product unarchived.',
      product,
    })
  } catch (err) {
    console.error('[archiveProduct]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
