import { Request, Response } from "express";
import { HospitalPatientService } from "../../services/hospital/patient.service";

const hospitalPatientService = new HospitalPatientService();

/** GET /api/v1/hospital/patients?search=&page=&limit= */
export const listHospitalPatients = async (req: Request, res: Response) => {
  try {
    const hospitalId = (req as any).hospitalId;
    if (!hospitalId) return res.status(401).json({ message: "Unauthorized" });

    const result = await hospitalPatientService.listPatients(String(hospitalId), {
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message || "Unable to load patients" });
  }
};

/** GET /api/v1/hospital/patients/:patientId */
export const getHospitalPatient = async (req: Request<{ patientId: string }>, res: Response) => {
  try {
    const hospitalId = (req as any).hospitalId;
    if (!hospitalId) return res.status(401).json({ message: "Unauthorized" });

    const result = await hospitalPatientService.getPatientDetails(String(hospitalId), req.params.patientId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message || "Unable to load patient" });
  }
};
