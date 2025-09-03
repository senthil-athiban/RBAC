import { Request, Response, Router } from "express";
import { Record } from "../models/records";
import { generateAccess } from "../middleware/access";
import { Permissions, PermissionTypes } from "../schema/permissions";
import authenticateJWT from "../middleware/auth";

const router = Router();
router.use(authenticateJWT);
const checkReadAccess = generateAccess(PermissionTypes.RECORDS, Permissions.READ);

router.get('/', checkReadAccess, async (req: Request, res: Response) => {
    try {
        const records = await Record.find();
        res.status(200).json({records});
    } catch (error) {
        console.log('failed to fetch records:', error);
    }
})


const checkWriteAccess = generateAccess(PermissionTypes.RECORDS, Permissions.CREATE);

router.post('/', checkWriteAccess, async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const user = req.user;
        await new Record({name, description, user: user.id }).save();
        return res.status(201).json({ message: 'New record has been created' });
    } catch (error) {
        console.log('failed to create records:', error);
        return res.status(500).json({ message: 'Failed to create new record' });
    }
});

const checkUpdateAccess = generateAccess(PermissionTypes.RECORDS, Permissions.UPDATE);

router.post('/:recordId', checkUpdateAccess, async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const recordId = req.params.recordId;
        // console.log('recordId:', recordId);
        console.log({name, description});
        const user = req.user;
        // console.log('user:', user)
        const record = await Record.findOne({ _id: recordId }); // TODO: access only user records. user: user.id
        // console.log('record:', record);
        // return res.status(404).json({ message: 'No record has been found with given id' });
        if(!record) {
            return res.status(404).json({ message: 'No record has been found with given id' });
        }
        await Record.findOneAndUpdate({ _id: recordId}, { name, description });
        return res.status(201).json({ message: 'Record has been edited' });
    } catch (error) {
        console.log('failed to edit records:', error);
        return res.status(500).json({ message: 'Failed to edited record' });
    }
});

const checkDeleteAccess = generateAccess(PermissionTypes.RECORDS, Permissions.DELETE);

router.delete('/:recordId', checkDeleteAccess, async (req: Request, res: Response) => {
    try {
        const recordId = req.params.recordId;
        const user = req.user;
        const record = await Record.findOne({ id: recordId, user: user.id });
        if(!record) {
            return res.status(404).json({ message: 'No record has been found with given id' });
        }
        await Record.findOneAndDelete({ id: recordId });
        return res.status(201).json({ message: 'Deleted'});
    } catch (error) {
        console.log('failed to delete records:', error);
        return res.status(500).json({ message: 'Failed to delete record' });
    }
})
export const recordRouter = router;