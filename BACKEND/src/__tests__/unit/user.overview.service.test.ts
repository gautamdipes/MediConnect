import { UserOverviewService } from "../../services/user/overview.service";
import { AppointmentModel } from "../../models/appointment.model";
import { clearDatabase } from "../test-utils";
import mongoose from "mongoose";

describe("UserOverviewService Unit Tests", () => {
  const service = new UserOverviewService();
  let userId: string;

  beforeEach(async () => {
    await clearDatabase();
    userId = new mongoose.Types.ObjectId().toHexString();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("getOverview – empty when no appointments", async () => {
    const overview = await service.getOverview(userId);
    expect(overview.stats.totalAppointments).toBe(0);
    expect(overview.upcoming).toEqual([]);
  });

  test("getOverview – counts all and lists only upcoming non-cancelled", async () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const past = new Date();
    past.setDate(past.getDate() - 1);

    await AppointmentModel.create({ patientId: new mongoose.Types.ObjectId(userId), date: future, time: "10:00", reason: "R", status: "PENDING" });
    await AppointmentModel.create({ patientId: new mongoose.Types.ObjectId(userId), date: future, time: "11:00", reason: "R", status: "CONFIRMED" });
    await AppointmentModel.create({ patientId: new mongoose.Types.ObjectId(userId), date: future, time: "12:00", reason: "R", status: "CANCELLED" });
    await AppointmentModel.create({ patientId: new mongoose.Types.ObjectId(userId), date: past, time: "09:00", reason: "R", status: "COMPLETED" });

    const overview = await service.getOverview(userId);
    expect(overview.stats.totalAppointments).toBe(4);
    expect(overview.upcoming.length).toBe(2);
  });
});
