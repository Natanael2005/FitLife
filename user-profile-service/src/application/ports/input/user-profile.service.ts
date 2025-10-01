import { UserProfile } from "../../../domain/entities/userprofile";

export interface UserProfileService {
    createUserProfile(uid: string, firstName: string, lastName: string, gender: string, profileCompleted: boolean, enableRecordatorios: boolean, notificationToken?: string | null): Promise<UserProfile>;
    getUserProfileByUid(uid: string): Promise<UserProfile | null>;
    updateUserProfile(uid: string, firstName?: string, lastName?: string, gender?: string, profileCompleted?: boolean, enableRecordatorios?: boolean, notificationToken?: string | null): Promise<UserProfile | null>;
    deleteUserProfile(uid: string): Promise<void>;
}