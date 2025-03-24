const InventoryModel = require('../models/inventory');

class Inventory {
    static async renderInventoryPage(req, res) {
        try {
            const inventoryItems = await InventoryModel.getAllInventoryItems();
            const products = await InventoryModel.getProductsList();
            res.render('inventory', { 
                inventoryItems, 
                products,
                error: null 
            });
        } catch (error) {
            res.status(500).render('inventory', { 
                inventoryItems: [], 
                products: [],
                error: 'Failed to load inventory' 
            });
        }
    }

    static async createInventoryItem(req, res) {
        try {
            const { productId, quantity, location } = req.body;
            await InventoryModel.createInventoryItem(productId, quantity, location);
            res.redirect('/inventory');
        } catch (error) {
            const inventoryItems = await InventoryModel.getAllInventoryItems();
            const products = await InventoryModel.getProductsList();
            res.status(500).render('inventory', { 
                inventoryItems, 
                products,
                error: 'Failed to create inventory item' 
            });
        }
    }

    static async updateInventoryItem(req, res) {
        try {
            const { inventoryId, productId, quantity, location } = req.body;
            await InventoryModel.updateInventoryItem(inventoryId, productId, quantity, location);
            res.redirect('/inventory');
        } catch (error) {
            const inventoryItems = await InventoryModel.getAllInventoryItems();
            const products = await InventoryModel.getProductsList();
            res.status(500).render('inventory', { 
                inventoryItems, 
                products,
                error: 'Failed to update inventory item' 
            });
        }
    }

    static async deleteInventoryItem(req, res) {
        try {
            const { inventoryId } = req.body;
            await InventoryModel.deleteInventoryItem(inventoryId);
            res.redirect('/inventory');
        } catch (error) {
            const inventoryItems = await InventoryModel.getAllInventoryItems();
            const products = await InventoryModel.getProductsList();
            res.status(500).render('inventory', { 
                inventoryItems, 
                products,
                error: 'Failed to delete inventory item' 
            });
        }
    }
}

module.exports = Inventory;