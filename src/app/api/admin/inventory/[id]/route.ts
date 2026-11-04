import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Inventory, InventoryMovement, AuditLog } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(['super_admin', 'inventory_manager']);
    const { id } = await params;
    const body = await request.json();
    const { adjustment, reason, type = 'adjustment', lowStockThreshold, trackInventory } = body;

    await connectDB();
    const inventory = await Inventory.findById(id);
    if (!inventory) {
      return NextResponse.json({ success: false, error: 'Inventory record not found' }, { status: 404 });
    }

    const prevQuantity = inventory.quantityOnHand;

    if (typeof adjustment === 'number') {
      inventory.quantityOnHand += adjustment;
      if (inventory.quantityOnHand < 0) inventory.quantityOnHand = 0;

      await InventoryMovement.create({
        inventory: inventory._id,
        product: inventory.product,
        variant: inventory.variant,
        type: type || (adjustment >= 0 ? 'in' : 'out'),
        quantity: adjustment,
        reason: reason || 'Manual adjustment via Admin Panel',
        performedBy: session.admin._id,
      });
    }

    if (typeof lowStockThreshold === 'number') {
      inventory.lowStockThreshold = lowStockThreshold;
    }

    if (typeof trackInventory === 'boolean') {
      inventory.trackInventory = trackInventory;
    }

    await inventory.save();

    await AuditLog.create({
      adminId: session.admin._id,
      adminEmail: session.admin.email,
      action: 'adjust_inventory',
      resourceType: 'Inventory',
      resourceId: inventory._id.toString(),
      changes: { prevQuantity, newQuantity: inventory.quantityOnHand, adjustment, reason },
    });

    return NextResponse.json({ success: true, data: inventory });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
