import { Request, Response } from 'express';
import BaseController from './base.controller';
import {
  createCategorySchema,
  createSubCategorySchema,
  productSchema,
  productSubcategoriesSchema,
  updateProductAssets,
  updatedProductSchema,
} from '../helper/validate';
import { uploadSingleImage } from '../helper/uploadImage';
import { deleteImage } from '../helper/deleteImage';
import logger from '../config/logger';
import { AddProductPayloadType } from '@types';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { isUUID, removeDuplicate } from '../helper';
import { TestUserId } from '../config/test';
import { capitalizeFisrtLetter } from '../helper/capitalizeFirstLetter';
import validurl from 'valid-url';

export default class ProductController extends BaseController {
  constructor() {
    super();
  }

  async checkSubCategoriesExists(ids: number[]) {
    const notfound = [];
    for (const id of ids) {
      const exists = await prisma.product_sub_category.findFirst({
        where: { id },
      });
      if (!exists) {
        notfound.push(id);
      }
    }
    return notfound;
  }

  async publishProduct(req: Request, res: Response) {
    const productId = req.params.productId;

    // Find the product by ID
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    // Check if the product exists
    if (!existingProduct) {
      return this.error(res, '--product/not-found', 'Product not found', 404);
    }

    // Update the is_published field to true
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        is_published: true,
      },
    });

    this.success(res, '--publish/success', 'Product published successfully', 201);
  }

  async addProduct(req: Request, res: Response) {
    const userId = ((req as any).user?.id as never) ?? (TestUserId as never);
    const file = req.file ?? null;
    const payload: AddProductPayloadType = req.body;

    const { error, value } = productSchema.validate(payload);

    if (error || !file) {
      return this.error(res, '--product/invalid-fields', error?.message ?? 'product image is missing.', 400, null);
    }

    const {
      name,
      currency,
      description,
      discountPrice,
      price,
      quantity,
      tax,
      // sub_category_id,
      category_id,
      shopId,
      assets_link,
      assets_name,
      assets_notes,
      assets_type,
    } = payload;

    // check if user is the owner of this shop
    const shopExists = await prisma.shop.findFirst({
      where: {
        AND: {
          merchant_id: userId,
          id: shopId,
        },
      },
    });

    if (shopExists === null) {
      return this.error(res, '--product/shop-notfound', 'Failed to crete product, shop not found.', 404);
    }

    // validate
    if (assets_link && !validurl.isUri(assets_link)) {
      return this.error(res, '--product/invalid-asset-link', 'Invalid asset link', 400);
    }

    // check if parent or child category exists
    // const subCatExists = await prisma.product_sub_category.findFirst({
    //   where: {
    //     id: +sub_category_id,
    //   },
    //   include: { parent_category: true },
    // });

    const prodCategory = await prisma.product_category.findFirst({
      where: {
        id: +category_id,
      },
      include: { sub_categories: true },
    });

    if (!prodCategory) {
      return this.error(res, '--product/category-notfound', 'Failed to create product, category do not exist.', 404);
    }

    const { isError, errorMsg, image } = await uploadSingleImage(file);

    if (isError) {
      logger.error(`Error uploading image: ${errorMsg}`);
    }

    // check if user exists
    const placeHolderImg = 'https://placehold.co/600x400/EEE/31343C?text=placeholder';

    const prodId = uuidv4();

    const product = await prisma.product.create({
      data: {
        id: prodId,
        name,
        currency,
        description,
        discount_price: discountPrice ? parseFloat(discountPrice) : 0,
        quantity: +quantity ?? 1,
        price: parseFloat(price),
        tax: parseFloat(tax),
        image: {
          create: {
            url: image.url ?? placeHolderImg,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
        shop: {
          connect: {
            id: shopId,
          },
        },
        category: {
          connect: {
            id: +category_id,
          },
        },
      },
      include: { image: true },
    });

    // create assets
    await prisma.product_digital_assets.create({
      data: {
        name: assets_name,
        notes: assets_notes ?? '',
        link: assets_link,
        product_id: prodId,
        type: assets_type,
      },
    });

    this.success(res, 'Product Added', 'Product has been added successfully', 201, {
      ...product,
      image: (product as any)?.image,
      category: {
        // id: subCatExists.id,
        // name: subCatExists.name,
        // parent: subCatExists.parent_category.name,
        id: prodCategory.id,
        sub_categories: prodCategory.sub_categories,
        parent: prodCategory.name,
      },
    });
  }

  async updateProduct(req: Request, res: Response) {
    const productId = req.params['product_id'];
    const userId = (req as any).user?.id ?? TestUserId;

    const payload: AddProductPayloadType = req.body;

    const { error, value } = updatedProductSchema.validate(payload);

    if (error) {
      return this.error(res, '--product/invalid-fields', error?.message ?? 'product image is missing.', 400, null);
    }

    // Find the product by ID
    const existingProduct = await prisma.product.findFirst({
      where: {
        AND: {
          id: productId,
          user_id: userId,
        },
      },
    });

    // Check if the product exists
    if (!existingProduct) {
      return this.error(res, '--product/not-found', 'Product not found', 404);
    }

    // update parent category and subcategory
    // let subCatExists = await prisma.product_sub_category.findFirst({
    //   where: { id: +value.sub_category_id },
    //   include: { parent_category: true },
    // });

    let categoryExists = await prisma.product_category.findFirst({
      where: { id: +value.category_id },
      include: { sub_categories: true },
    });

    if (!categoryExists) {
      return this.error(res, '--product/category-notfound', 'Failed to update product, category do not exist.', 404);
    }

    // remove parent_category_id
    // delete value['sub_category_id'];
    delete value['category_id'];
    delete value['shopId'];

    // await prisma.product.update({
    //   where: { id: productId },
    //   data: { ...value, category_id: +payload.sub_category_id },
    // });
    await prisma.product.update({
      where: { id: productId },
      data: { ...value, category_id: +payload.category_id },
    });

    const productResp = await prisma.product.findFirst({
      where: { id: productId },
      include: {
        image: true,
      },
    });

    this.success(res, 'Product Updated', 'Product has been updated successfully', 200, {
      productResp,
      category: {
        id: categoryExists.id,
        name: categoryExists.name,
        sub_categories: categoryExists.sub_categories,
      },
    });
  }

  async updateProductAssets(req: Request, res: Response) {
    const productId = req.params['product_id'];
    const userId = (req as any).user?.id ?? TestUserId;

    const payload = req.body;
    const { error, value } = updateProductAssets.validate(payload);
    if (error) {
      return this.error(res, '--product/invalid-fields', error?.message ?? 'product image is missing.', 400, null);
    }

    // Find the product by ID
    const existingProduct = await prisma.product.findFirst({
      where: {
        AND: {
          id: productId,
          user_id: userId,
        },
      },
      include: { digital_assets: true },
    });

    // Check if the product exists
    if (!existingProduct) {
      return this.error(res, '--product/not-found', 'Product not found', 404);
    }

    // validate the assets url
    if (value.link && !validurl.isUri(value.link)) {
      return this.error(res, '--product/invalid-asset-link', 'Invalid asset link', 400);
    }

    // check if product has an assets
    if (!existingProduct.digital_assets) {
      return this.error(res, '--product/asset-notfound', 'Failed to update, asset not found.', 404);
    }

    // update product assets
    await prisma.product_digital_assets.update({
      where: {
        id: existingProduct.digital_assets.id,
      },
      data: value,
    });

    this.success(res, '--product/assets-updated', 'product assets updated successfully', 200, value);
  }

  async addImage(req: Request, res: Response) {
    const file = req.file ?? null;
    const userId = (req as any).user?.id ?? TestUserId;
    const productId = req.params['product_id'];

    if (!file) {
      return this.error(res, '--product/invalid-fields', 'product image is missing.', 400, null);
    }

    // Find the product by ID and ensure is owned by auth user
    const existingProduct = await prisma.product.findFirst({
      where: {
        AND: {
          id: productId,
          user_id: userId,
        },
      },
    });

    // Check if the product exists
    if (!existingProduct) {
      return this.error(res, '--product/not-found', 'Product not found', 404);
    }

    const { isError, errorMsg, image } = await uploadSingleImage(file);

    if (isError) {
      logger.error(`Error uploading image: ${errorMsg}`);
    }

    const productImage = await prisma.product_image.create({
      data: {
        url: image.url,
        product_id: productId,
      },
    });

    this.success(res, 'Image Added', 'Product image added successfully', 201, {
      existingProduct,
      image: productImage,
    });
  }

  async getProductImages(req: Request, res: Response) {
    const file = req.file ?? null;
    const productId = req.params['product_id'];
    const userId = (req as any).user?.id ?? TestUserId;

    // Find the product by ID and ensure is owned by auth user
    const existingProduct = await prisma.product.findFirst({
      where: {
        AND: {
          id: productId,
          user_id: userId,
        },
      },
    });

    // Check if the product exists
    if (!existingProduct) {
      return this.error(res, '--product/not-found', 'Product not found', 404);
    }

    const productImages = await prisma.product_image.findMany({
      where: {
        product_id: productId,
      },
    });

    this.success(res, 'Images', 'Product images found successfully', 200, {
      productImages,
    });
  }

  async updateImage(req: Request, res: Response) {
    const file = req.file ?? null;
    const productId = req.params['product_id'];
    const imageId = req.params['image_id'];
    const userId = (req as any).user?.id ?? TestUserId;

    // Find the product by ID and ensure is owned by auth user
    const existingProduct = await prisma.product.findFirst({
      where: {
        AND: {
          id: productId,
          user_id: userId,
        },
      },
    });

    // Check if the product exists
    if (!existingProduct) {
      return this.error(res, '--product/not-found', 'Product not found', 404);
    }

    // Find the image by ID
    const existingImage = await prisma.product_image.findUnique({
      where: {
        id: parseInt(imageId),
      },
    });

    // Check if the image exists
    if (!existingImage) {
      return this.error(res, '--iamge/not-found', 'Image not found', 404);
    }

    await deleteImage(existingImage.url);

    const { isError, errorMsg, image } = await uploadSingleImage(file);

    if (isError) {
      logger.error(`Error uploading image: ${errorMsg}`);
    }

    const productImage = await prisma.product_image.update({
      where: {
        id: parseInt(imageId),
      },
      data: {
        url: image.url,
      },
    });

    this.success(res, 'Image updated', 'Product image updated successfully', 200, {
      existingProduct,
      image: productImage,
    });
  }

  async deleteImage(req: Request, res: Response) {
    const productId = req.params['product_id'];
    const imageId = req.params['image_id'];
    const userId = (req as any).user?.id ?? TestUserId;

    // Find the product by ID and ensure is owned by auth user
    const existingProduct = await prisma.product.findFirst({
      where: {
        AND: {
          id: productId,
          user_id: userId,
        },
      },
    });

    // Check if the product exists
    if (!existingProduct) {
      return this.error(res, '--product/not-found', 'Product not found', 404);
    }

    // Find the image by ID
    const existingImage = await prisma.product_image.findUnique({
      where: {
        id: parseInt(imageId),
      },
    });

    // Check if the image exists
    if (!existingImage) {
      return this.error(res, '--iamge/not-found', 'Image not found', 404);
    }

    await deleteImage(existingImage.url);

    await prisma.product_image.delete({
      where: {
        id: parseInt(imageId),
      },
    });

    this.success(res, 'Image deleted', 'Product image deleted successfully', 200, {
      existingImage,
    });
  }

  async unpublishProduct(req: Request, res: Response) {
    const productId = req.params.productId;

    //check if product exists
    const prodExists = await prisma.product.findFirst({ where: { id: productId } });

    if (!prodExists) {
      return this.error(res, '--product/notfound', 'Failed to unpublish, product not found', 404);
    }

    // Update the is_published field to false
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        is_published: false,
      },
    });

    this.success(res, 'Product Unpublished', 'Product has been unpublished successfully', 201, updatedProduct);
  }

  async SearchProductsByName(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    const productname = req.query.productname as string;

    let products;
    if (productname) {
      products = await prisma.product.findMany({
        where: {
          name: {
            contains: productname,
            mode: 'insensitive',
          },
          is_deleted: 'active',
        },
        include: { image: true },
      });
    } else {
      products = await prisma.product.findMany({
        where: {
          AND: {
            user_id: userId,
            is_deleted: 'active',
          },
        },
        include: { image: true },
      });
    }

    const allProd = [];
    if (products.length > 0) {
      for (const p of products) {
        const cat = await prisma.product_category.findFirst({
          where: { id: p.category_id },
          include: { sub_categories: true },
        });
        allProd.push({
          products: p,
          category: {
            ...cat,
          },
          image: p.image,
          price: p.price,
          discount: p.discount_price,
          quantity: p.quantity,
          currency: p.currency,
          tax: p.tax,
          description: p.description,
        });
      }
    }
    return this.success(res, 'All Products Shown', 'Products have been listed', 200, allProd);
  }

  async getAllProducts(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const itemsPerPage = req.query.itemsPerPage ? parseInt(req.query.itemsPerPage as string, 10) : 12;

    // Calculate the offset to skip the appropriate number of items
    const offset = (page - 1) * itemsPerPage;

    // Get all products with pagination and include related data
    const products = await prisma.product.findMany({
      where: {
        AND: {
          is_deleted: 'active',
          user_id: userId,
        },
      },
      include: { image: true },
      take: itemsPerPage,
      skip: offset,
    });
    const allProd = [];

    if (products.length > 0) {
      for (const p of products) {
        let categories: object | null = null;
        // const category = await prisma.product_sub_category.findFirst({
        //   where: { id: +p.category_id },
        //   include: { parent_category: true },
        // });
        const category = await prisma.product_category.findFirst({
          where: { id: +p.category_id },
          include: { sub_categories: true },
        });

        if (category) {
          categories = {
            name: category.name,
            id: category.id,
            // sub_category: {
            //   id: category.id,
            //   name: category.name,
            // },
            sub_category: category.sub_categories,
          };
        }

        const promoProd = await prisma.promo_product.findFirst({ where: { product_id: p.id } });
        allProd.push({
          ...p,
          categories,
          image: p.image,
          promo: promoProd,
        });
      }
    }

    console.log(allProd.length);

    return this.success(res, 'All Products Shown', 'Products have been listed', 200, {
      itemsPerPage,
      page,
      totalPages: Math.ceil(allProd.length / itemsPerPage),
      totalProducts: allProd.length,
      products: allProd,
    });
  }

  async getProductById(req: Request, res: Response) {
    const productId = req.params.product_id;

    const product = await prisma.product.findFirst({
      where: {
        AND: {
          id: productId,
          is_deleted: 'active',
        },
      },
      select: {
        id: true,
        image: true,
        is_deleted: true,
        is_published: true,
        price: true,
        discount_price: true,
        quantity: true,
        currency: true,
        tax: true,
        description: true,
        category_id: true,
        name: true,
        shop: true,
      },
    });

    if (!product) {
      return this.error(res, '--product/missing-product', 'Product not found.', 404, null);
    }

    let category: object | null = null;
    // const subCategory = await prisma.product_sub_category.findFirst({
    //   where: { id: +product.category_id },
    //   include: { parent_category: true },
    // });
    const categories = await prisma.product_category.findFirst({
      where: { id: +product.category_id },
      include: { sub_categories: true },
    });

    delete product['category_id'];

    if (categories) {
      category = {
        name: categories.name,
        // sub_category: {
        //   id: subCategory.id,
        //   name: subCategory.name,
        // },
        sub_categories: categories.sub_categories,
      };
    }

    // include promo if needed

    const data = {
      ...product,
      category,
    };

    return this.success(res, `Product ${productId} Shown`, 'Products have been listed', 200, data);
  }

  //! Currently been used by Marketplace Team.
  async getMarketplaceProducts(req: Request, res: Response) {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const itemsPerPage = req.query.itemsPerPage ? parseInt(req.query.itemsPerPage as string, 10) : 10;

    // Calculate the offset to skip the appropriate number of items
    const skip = (page - 1) * itemsPerPage;
    const take = itemsPerPage;

    const products = await prisma.product.findMany({
      where: {
        AND: {
          is_deleted: 'active',
        },
      },
      include: { image: true, shop: true },
      skip,
      take,
    });
    const allProd = [];
    if (products.length > 0) {
      for (const p of products) {
        let categories: object | null = null;
        const category = await prisma.product_sub_category.findFirst({
          where: { id: +p.category_id },
          include: { parent_category: true },
        });

        if (category) {
          categories = {
            name: category.parent_category.name,
            id: category.parent_category.id,
            sub_category: {
              id: category.id,
              name: category.name,
            },
          };
        }

        const promoProd = await prisma.promo_product.findFirst({ where: { product_id: p.id } });
        const shop = await prisma.shop.findFirst({
          where: {
            AND: {
              id: p.shop_id,
              is_deleted: 'active',
            },
          },
          select: { name: true, rating: true, id: true },
        });

        if (shop) {
          allProd.push({
            ...p,
            shop,
            categories,
            image: p.image,
            promo: promoProd,
          });
        }
      }
    }
    return this.success(res, 'All Products Shown', 'Products have been listed', 200, {
      page: +page,
      pageSize: +itemsPerPage,
      totalProducts: allProd.length,
      totalPages: Math.ceil(allProd.length / itemsPerPage),
      products: allProd,
    });
  }

  async deleteProduct(req: Request, res: Response) {
    const productId = req.params['product_id'];
    const userId = (req as any).user?.id ?? TestUserId;

    if (typeof productId === 'undefined') {
      return this.error(res, '--product_delete/invalid-fields', 'Invalid field provided.', 400);
    }

    // check if field parameter is a uuid
    if (!isUUID(productId)) {
      return this.error(
        res,
        '--product_delete/invalid-field',
        'product id is invalid, expected product_id in uuid format.',
        400,
      );
    }

    // Check if the product exists before attempting to delete it
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        user_id: userId,
      },
    });

    if (!product) {
      return this.error(res, '--product_delete/product-notfound', 'Product not found', 404);
    }

    // If the product exists, proceed with deletion
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        is_deleted: 'temporary',
      },
    });

    return this.success(res, '--product_delete/success', 'Product has been deleted successfully', 200);
  }

  async createCategory(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    const { error, value } = createCategorySchema.validate(req.body);

    if (error) {
      return this.error(res, '--product_category/invalid-category data', 'Please provide a valid category name.', 400);
    }
    const { parent_id, name } = value;

    const newName = capitalizeFisrtLetter(name);
    const existingCategory = await prisma.product_category.findFirst({
      where: {
        name: newName,
      },
    });
    if (existingCategory) {
      return this.error(
        res,
        '--product_category/category-exists',
        `Category with name '${newName}' already exists. Please choose a different name.`,
        409,
      );
    }

    // Checking if parent_id is null to determine if it's a parent or subcategory
    if (parent_id === null || parent_id === undefined || parent_id == '') {
      // Creating a parent category
      const parentCategory = await prisma.product_category.create({
        data: {
          name: newName,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return this.success(res, '--created-parentCategory/success', `${newName} created successfully`, 201, {
        parentCategory,
      });
    }
    //create a subCategory
    const existingSubCategory = await prisma.product_sub_category.findFirst({
      where: {
        name: newName,
      },
    });
    if (existingSubCategory) {
      return this.error(
        res,
        '--product_sub_category/category-exists',
        `Sub-category with name '${newName}' already exists. Please choose a different name.`,
        409,
      );
    }

    const subCategory = await prisma.product_sub_category.create({
      data: {
        name: newName,
        parent_category: {
          connect: {
            id: parent_id,
          },
        },
      },
    });
    return this.success(res, '--created-subCategory/success', `${newName} created successfully`, 201, {
      subCategory,
    });
  }

  async createCategoryV2(req: Request, res: Response) {
    const { error, value } = createCategorySchema.validate(req.body);
    const userId = (req as any).user?.id ?? TestUserId;
    if (error) {
      return this.error(res, '--product_category/invalid-category data', 'Please provide a valid category name.', 400);
    }

    const category = await prisma.product_category.create({
      data: {
        name: value.name ?? '',
        user_id: userId,
      },
    });
    return this.success(res, '--created-Category/success', `${category} created successfully`, 201, {
      category,
    });
  }

  async createSubCategoryV2(req: Request, res: Response) {
    const { error, value } = createSubCategorySchema.validate(req.body);
    const userId = (req as any).user?.id ?? TestUserId;

    console.log(value);

    if (error) {
      return this.error(res, '--product_category/invalid-category data', 'Please provide a valid category name.', 400);
    }

    const existingCategory = await prisma.product_category.findFirst({
      where: {
        id: value.parent_id,
      },
    });

    if (!existingCategory) {
      return this.error(
        res,
        '--product_category/category-exists',
        `Category with id ${value.parent_id} does not exists.`,
        409,
      );
    }

    const category = await prisma.product_sub_category.create({
      data: {
        name: value.name,
        parent_category_id: value.parent_id,
      },
    });

    return this.success(
      res,
      '--created-SubCategory/success',
      `Sub category '${category.name}' created successfully`,
      201,
      {
        category,
      },
    );
  }

  async deleteCategory(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    const category_id = req.params['cat_id'];
    const catType = req.params['type'];

    if (isNaN(+category_id)) {
      return this.error(res, '--delete_category/invalid_id', 'Invalid category id type.', 400);
    }

    const validCatType = ['parent', 'child'];

    if (!validCatType.includes(catType as string)) {
      return this.error(res, '--delete_category/invalid_type', 'Invalid category type.', 400);
    }

    if (catType === 'parent') {
      // check if it exists
      const catExist = await prisma.product_category.findFirst({
        where: {
          AND: {
            id: +category_id,
            user_id: userId,
          },
        },
      });
      console.log(catExist);
      if (!catExist) {
        return this.error(res, '--delete_category/notfound', 'parent category not found.', 404);
      }

      // delete the category
      await prisma.product_category.delete({
        where: { id: +category_id },
      });

      return this.success(res, '--delete_category/success', 'category deleted.', 200);
    } else if (catType === 'child') {
      // check if it exists
      const catExist = await prisma.product_sub_category.findFirst({
        where: { id: +category_id },
        include: { parent_category: true },
      });

      if (!catExist) {
        return this.error(res, '--delete_category/notfound', 'sub_category not found.', 404);
      }

      // delete the category
      await prisma.product_sub_category.delete({
        where: { id: +category_id },
      });

      return this.success(res, '--delete_category/success', 'sub_category deleted.', 200);
    }
  }

  async getAllCategories(req: Request | any, res: Response | any) {
    const categories = await prisma.product_category.findMany({
      include: {
        sub_categories: true,
      },
    });
    this.success(res, '--categories/all', 'categories fetched successfully', 200, categories);
  }

  //   async getProductSelectedCategories(req: Request, res: Response) {
  //     const productId = req.params.productId;
  //     // Fetch the selected categories for the given product_id
  //     const selectedCategories = await prisma.selected_categories.findMany({
  //       where: { product_id: productId },
  //       include: {
  //         product: true,
  //         sub_category: true,
  //         product_category: true,
  //       },
  //     });

  //     if (selectedCategories.length == 0) {
  //       return this.error(res, '--selectedCategories/invalid req', 'Product not found', 404);
  //     }

  //     const productName = selectedCategories[0].product.name;
  //     const data = {
  //       id: productId,
  //       name: productName,
  //       categories: selectedCategories.map((selectedCategory) => ({
  //         subCategory: selectedCategory.sub_category,
  //         productCategory: selectedCategory.product_category,
  //       })),
  //     };

  //     return this.success(
  //       res,
  //       '--selectedCategories/product selected category retreived',
  //       'produt categories successfully retreived',
  //       200,
  //       [data],
  //     );
  //   }
  //
}
