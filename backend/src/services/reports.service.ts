import { injectable, inject } from "tsyringe";
import { SalesRepository } from "@repositories/sales.repository";
import type { ISalesRepository } from "@repositories/sales.repository";

@injectable()
export class ReportsService {
  constructor(
    @inject(SalesRepository) private salesRepository: ISalesRepository,
  ) {}

  public async getDailyReport(date: Date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const stats = await this.salesRepository.getSalesStats(start, end);
    const sales = await this.salesRepository.findAll({
      startDate: start,
      endDate: end,
    });
    const paymentBreakdown =
      await this.salesRepository.getPaymentMethodBreakdown(start, end);
    const topProducts = await this.salesRepository.getTopProducts(
      start,
      end,
      5,
    );
    const cashierPerformance = await this.salesRepository.getCashierPerformance(
      start,
      end,
    );

    return {
      period: "Daily",
      date: start,
      stats,
      salesCount: sales.length,
      paymentBreakdown,
      topProducts,
      cashierPerformance,
    };
  }

  public async getWeeklyReport(date: Date = new Date()) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Saturday
    end.setHours(23, 59, 59, 999);

    const stats = await this.salesRepository.getSalesStats(start, end);
    const dailyBreakdown = await this.salesRepository.getDailyBreakdown(
      start,
      end,
    );
    const paymentBreakdown =
      await this.salesRepository.getPaymentMethodBreakdown(start, end);
    const topProducts = await this.salesRepository.getTopProducts(
      start,
      end,
      10,
    );
    const cashierPerformance = await this.salesRepository.getCashierPerformance(
      start,
      end,
    );

    return {
      period: "Weekly",
      startDate: start,
      endDate: end,
      stats,
      dailyBreakdown,
      paymentBreakdown,
      topProducts,
      cashierPerformance,
    };
  }

  public async getMonthlyReport(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const stats = await this.salesRepository.getSalesStats(start, end);
    const dailyBreakdown = await this.salesRepository.getDailyBreakdown(
      start,
      end,
    );
    const paymentBreakdown =
      await this.salesRepository.getPaymentMethodBreakdown(start, end);
    const topProducts = await this.salesRepository.getTopProducts(
      start,
      end,
      10,
    );
    const cashierPerformance = await this.salesRepository.getCashierPerformance(
      start,
      end,
    );

    return {
      period: "Monthly",
      startDate: start,
      endDate: end,
      stats,
      dailyBreakdown,
      paymentBreakdown,
      topProducts,
      cashierPerformance,
    };
  }

  public async getCustomRangeReport(startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const stats = await this.salesRepository.getSalesStats(start, end);
    const dailyBreakdown = await this.salesRepository.getDailyBreakdown(
      start,
      end,
    );
    const paymentBreakdown =
      await this.salesRepository.getPaymentMethodBreakdown(start, end);
    const topProducts = await this.salesRepository.getTopProducts(
      start,
      end,
      10,
    );
    const cashierPerformance = await this.salesRepository.getCashierPerformance(
      start,
      end,
    );

    return {
      period: "Custom Range",
      startDate: start,
      endDate: end,
      stats,
      dailyBreakdown,
      paymentBreakdown,
      topProducts,
      cashierPerformance,
    };
  }
}
