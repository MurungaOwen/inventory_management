import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { ReportsService } from "@services/reports.service";
import { asyncHandler } from "@utils/asyncHandler";

@injectable()
export class ReportsController {
  constructor(@inject(ReportsService) private reportsService: ReportsService) {}

  public getDailyReport = asyncHandler(async (req: Request, res: Response) => {
    const date = req.query.date
      ? new Date(req.query.date as string)
      : new Date();
    const report = await this.reportsService.getDailyReport(date);
    res.status(200).json({ data: report, message: "dailyReport" });
  });

  public getWeeklyReport = asyncHandler(async (req: Request, res: Response) => {
    const date = req.query.date
      ? new Date(req.query.date as string)
      : new Date();
    const report = await this.reportsService.getWeeklyReport(date);
    res.status(200).json({ data: report, message: "weeklyReport" });
  });

  public getMonthlyReport = asyncHandler(
    async (req: Request, res: Response) => {
      const year =
        parseInt(req.query.year as string) || new Date().getFullYear();
      const month =
        parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const report = await this.reportsService.getMonthlyReport(year, month);
      res.status(200).json({ data: report, message: "monthlyReport" });
    },
  );

  public getCustomRangeReport = asyncHandler(
    async (req: Request, res: Response) => {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({ message: "Invalid date range" });
        return;
      }

      const report = await this.reportsService.getCustomRangeReport(
        startDate,
        endDate,
      );
      res.status(200).json({ data: report, message: "customRangeReport" });
    },
  );
}
