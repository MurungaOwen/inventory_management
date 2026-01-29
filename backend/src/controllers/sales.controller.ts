import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { SalesService } from '@services/sales.service';
import { RequestWithUser } from '@interfaces/auth.interface';
import { asyncHandler } from '@utils/asyncHandler';

@injectable()
export class SalesController {
  constructor(@inject(SalesService) private salesService: SalesService) {}

  public createSale = asyncHandler(async (req: Request, res: Response) => {
    const { paymentMethod, items } = req.body;
    const userReq = req as RequestWithUser;
    const cashierId = userReq.user.id;

    const sale = await this.salesService.createSale(cashierId, paymentMethod, items);
    res.status(201).json({ data: sale.toPersistence(), message: 'created' });
  });

  public getSalesHistory = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, cashierId } = req.query;
    const sales = await this.salesService.getSalesHistory({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      cashierId: cashierId ? String(cashierId) : undefined,
    });
    res.status(200).json({ data: sales.map((s) => s.toPersistence()), message: 'findAll' });
  });

  public getSaleById = asyncHandler(async (req: Request, res: Response) => {
    const saleId = req.params.id;
    const sale = await this.salesService.getSaleById(saleId);
    res.status(200).json({ data: sale.toPersistence(), message: 'findOne' });
  });
}
