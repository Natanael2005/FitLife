import express from 'express';
import { UserProfileService } from '../../../application/ports/input/user-profile.service';
import { createUserProfileSchema, CreateUserProfileDto } from '../../../shared/userprofile.schema';
export class UserProfileController {
    constructor(private readonly userProfileService: UserProfileService) { }

    /**
 * @swagger
 * /user-profiles:
 *   post:
 *     summary: Crear un nuevo perfil de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserProfileDto'
 *     responses:
 *       201:
 *         description: Perfil de usuario creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
    async createUserProfile(req: express.Request, res: express.Response): Promise<void> {
        const result = createUserProfileSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error });
            return;
        }
        const createUserProfileDto: CreateUserProfileDto = result.data;
        const { uid, firstName, lastName, gender, profileCompleted, enableRecordatorios, notificationToken } = createUserProfileDto;
        const userProfile = await this.userProfileService.createUserProfile(
            uid,
            firstName,
            lastName,
            gender,
            profileCompleted,
            enableRecordatorios,
            notificationToken
        );
        res.status(201).json(userProfile);
    }

    /**
 * @swagger
 * /user-profiles/{uid}:
 *   get:
 *     summary: Obtener un perfil de usuario por UID
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: UID del usuario
 *     responses:
 *       200:
 *         description: Perfil de usuario encontrado
 *       404:
 *         description: Perfil de usuario no encontrado
 */
    async getUserProfile(req: express.Request, res: express.Response): Promise<void> {
        const { uid } = req.params;
        const userProfile = await this.userProfileService.getUserProfileByUid(uid);
        if (!userProfile) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }
        res.status(200).json(userProfile);
    }

    async updateUserProfile(req: express.Request, res: express.Response): Promise<void> {
        const { uid } = req.params;
        const result = createUserProfileSchema.partial().safeParse(req.body);
        if (result.success) {
            const { firstName, lastName, gender, profileCompleted, enableRecordatorios, notificationToken } = result.data;
            const userProfile = await this.userProfileService.updateUserProfile(uid, firstName, lastName, gender, profileCompleted, enableRecordatorios, notificationToken);
            if (!userProfile) {
                res.status(404).json({ error: 'User profile not found' });
                return;
            }
            res.status(200).json(userProfile);
        } else {
            res.status(400).json({ error: result.error });
            return;
        }
    }

    async deleteUserProfile(req: express.Request, res: express.Response): Promise<void> {
        const { uid } = req.params;
        await this.userProfileService.deleteUserProfile(uid);
        res.status(204).send();
    }
}