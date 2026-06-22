import Report from "../models/Report.js";

export async function createReport(
  req,
  res
) {

  try {

    const {
      location,
      description
    } = req.body;

    const report =
      await Report.create({

        location,
        description

      });

    res.status(201).json(report);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

}