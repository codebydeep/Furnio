import db from '../libs/db.js'

export async function createProduct(req, res) {
  try {
    const { name, type, salesPrice, costPrice, category } = req.body

    const product = await db.product.create({
      data: { name, type, salesPrice, costPrice, category: category ?? null },
    })

    return res.status(201).json({ message: 'Product created successfully.', product })
  } catch (err) {
    console.error('[createProduct]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getAllProducts(req, res) {
  try {
    const { type, category, archived } = req.query

    const where = {}
    if (type)                where.type     = type
    if (category)            where.category = category
    if (archived === 'true') where.archived = true
    else                     where.archived = false

    const products = await db.product.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return res.status(200).json(products)
  } catch (err) {
    console.error('[getAllProducts]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function getProductById(req, res) {
  try {
    const product = await db.product.findUnique({ where: { id: req.params.id } })

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }

    return res.status(200).json(product)
  } catch (err) {
    console.error('[getProductById]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' })
    }
    if (existing.archived) {
      return res.status(400).json({ message: 'Cannot update an archived product.' })
    }

    const product = await db.product.update({
      where: { id },
      data: req.body,
    })

    return res.status(200).json({ message: 'Product updated successfully.', product })
  } catch (err) {
    console.error('[updateProduct]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function archiveProduct(req, res) {
  try {
    const { id } = req.params

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' })
    }
    if (existing.archived) {
      return res.status(400).json({ message: 'Product is already archived.' })
    }

    const product = await db.product.update({
      where: { id },
      data: { archived: true },
    })

    return res.status(200).json({ message: 'Product archived successfully.', product })
  } catch (err) {
    console.error('[archiveProduct]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export async function unarchiveProduct(req, res) {
  try {
    const { id } = req.params

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' })
    }
    if (!existing.archived) {
      return res.status(400).json({ message: 'Product is not archived.' })
    }

    const product = await db.product.update({
      where: { id },
      data: { archived: false },
    })

    return res.status(200).json({ message: 'Product restored successfully.', product })
  } catch (err) {
    console.error('[unarchiveProduct]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
