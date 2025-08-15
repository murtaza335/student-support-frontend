import {z} from 'zod';
import { responseSchema } from '~/lib/responseSchema';
import { teamWorkerStatusEnum } from '~/types/enums';
import { teamWorkerSchema } from '~/types/teams/teamWorker';

// Schema for individual unapproved registration
export const unapprovedRegistrationSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  picUrl: z.string().url().nullable(),
  phone: z.string().nullable(),
  role: z.string(),
  department: z.string(),
  officeNumber: z.string().nullable(),
  designation: z.string().nullable(),
  locationId: z.number(),
  location: z.string(),
  createdAt: z.string().datetime(),
  teamName: z.string().nullable(),
});

// Schema for the array of unapproved registrations
export const unapprovedRegistrationsDataSchema = z.object({
    unapprovedUsers: z.array(unapprovedRegistrationSchema),
});
export const unapprovedRegistrationsResponseSchema = responseSchema(unapprovedRegistrationsDataSchema);


// {
//     "data": {
//         "teams": [
//             {
//                 "id": 1,
//                 "name": "Network Services",
//                 "description": "Handles all networking-related issues and setups.",
//                 "status": "active",
//                 "createdDate": "2025-07-14",
//                 "manager": {
//                     "id": "user_30XSubspWRWgeQvXhw3ydTpbHHk",
//                     "name": "ibsham tariq",
//                     "email": "ibsham.tariq123@gmail.com",
//                     "phone": "03308415533",
//                     "picUrl": "https://ia601307.us.archive.org/1/items/instagram-plain-round/instagram%20dip%20in%20hair.jpg",
//                     "privileges": {}
//                 },
//                 "members": [
//                     {
//                         "id": "user_30XcBVGbh1twjGOJ6nrPDLBFLd8",
//                         "name": "ali ahmad worker",
//                         "role": "Team Member",
//                         "email": "absham.tariq123@gmail.com",
//                         "phone": "03308415533",
//                         "picUrl": "https://ia601307.us.archive.org/1/items/instagram-plain-round/instagram%20dip%20in%20hair.jpg",
//                         "status": "active",
//                         "joinDate": "2025-07-31",
//                         "points": 25
//                     },
//                     {
//                         "id": "user_30XSckrk5P1TJlIg8xptICdPeAc",
//                         "name": "rohaan  worker",
//                         "role": "Team Member",
//                         "email": "worker1+clerk_test@example.com",
//                         "phone": "123412341123",
//                         "picUrl": "https://ia601307.us.archive.org/1/items/instagram-plain-round/instagram%20dip%20in%20hair.jpg",
//                         "status": "active",
//                         "joinDate": "2025-07-31",
//                         "points": 0
//                     }
//                 ]
//             },
//             {
//                 "id": 2,
//                 "name": "Accounts Services",
//                 "description": "Manages user accounts, credentials, and access-related matters.",
//                 "status": "active",
//                 "createdDate": "2025-07-14",
//                 "manager": {
//                     "id": "user_30k1wSqVtbzSXqLpWURbP30dZPw",
//                     "name": "Rohaan Ali",
//                     "email": "accmanager123+clerk_test@example.com",
//                     "phone": "03202458888",
//                     "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1754157047/profile_pictures/s35w3qnptb0s3oho0xul.jpg",
//                     "privileges": {}
//                 },
//                 "members": [
//                     {
//                         "id": "user_30k5f8XG9MYgUpCpGmS0QJxxV4T",
//                         "name": "worker second",
//                         "role": "2",
//                         "email": "worker22+clerk_test@example.com",
//                         "phone": "03202458888",
//                         "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1754158897/profile_pictures/wjkra8l1gjbzdlldim03.jpg",
//                         "status": "busy",
//                         "joinDate": "2025-08-02",
//                         "points": 2
//                     },
//                     {
//                         "id": "user_30k5VWkKHHO1rAkbOxNI8zzR7a1",
//                         "name": "worker first",
//                         "role": "2",
//                         "email": "worker11+clerk_test@example.com",
//                         "phone": "03202458888",
//                         "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1754158804/profile_pictures/tjjeghibzvnsaewpxs0o.jpg",
//                         "status": "busy",
//                         "joinDate": "2025-08-02",
//                         "points": 3
//                     },
//                     {
//                         "id": "user_30x44c7z4fiGast0fSF3zAQQo3H",
//                         "name": "worker 77",
//                         "role": "2",
//                         "email": "worker77+clerk_test@example.com",
//                         "phone": "03202458888",
//                         "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1754555737/profile_pictures/dpfr6q5lpe0cjkebceb9.jpg",
//                         "status": "active",
//                         "joinDate": "2025-08-07",
//                         "points": 3
//                     },
//                     {
//                         "id": "user_30x3qRLb2AENKdrx6jRpOhqmBhx",
//                         "name": "worker 66",
//                         "role": "2",
//                         "email": "worker55+clerk_test@example.com",
//                         "phone": "03202458888",
//                         "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1754555632/profile_pictures/xid7xgghu9fdzglnu9xo.jpg",
//                         "status": "active",
//                         "joinDate": "2025-08-07",
//                         "points": 3
//                     },
//                     {
//                         "id": "user_30x3NwzwiLGlsmN8UqMLHj38mUF",
//                         "name": "worker 44",
//                         "role": "2",
//                         "email": "worker44+clerk_test@example.com",
//                         "phone": "03202458888",
//                         "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1754555550/profile_pictures/ebshlc7vszexx0aljsgy.jpg",
//                         "status": "active",
//                         "joinDate": "2025-08-07",
//                         "points": 5
//                     }
//                 ]
//             },
//             {
//                 "id": 3,
//                 "name": "Software Support",
//                 "description": "Responsible for software installation, bugs, and application-level problems.",
//                 "status": "active",
//                 "createdDate": "2025-07-14",
//                 "manager": {
//                     "id": "user_30XT19fMPDf9YYPhd5xarraqMeP",
//                     "name": "Manager Murtaza",
//                     "email": "mmurtaza.bscs24seecs@seecs.edu.pk",
//                     "phone": "03258180307",
//                     "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1753956184/profile_pictures/aabqw2yv4t2l4tepgkhf.jpg",
//                     "privileges": {}
//                 },
//                 "members": [
//                     {
//                         "id": "user_30eXDcrmHgib6xpy4SesPQv3gUD",
//                         "name": "Mercedes AMG",
//                         "role": "3",
//                         "email": "azeeshan.bsai24seecs@seecs.edu.pk",
//                         "phone": "0344 4444477",
//                         "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1753988955/profile_pictures/qnwawezepflsdbthqfkl.png",
//                         "status": "active",
//                         "joinDate": "2025-07-31",
//                         "points": 105
//                     },
//                     {
//                         "id": "user_30eX1ZdRM9GSqMpsduhGbe9BFW5",
//                         "name": "Scuderia Ferrari",
//                         "role": "3",
//                         "email": "abdulmajidzeeshan4@gmail.com",
//                         "phone": "0344 4444444",
//                         "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1753988853/profile_pictures/q53eoj4bsrcygxtscnzh.png",
//                         "status": "busy",
//                         "joinDate": "2025-07-31",
//                         "points": 10
//                     },
//                     {
//                         "id": "user_30aM4rJ7A2B5OsTKR9xtW4JEHAV",
//                         "name": "worker Murtaza",
//                         "role": "3",
//                         "email": "muzu335@gmail.com",
//                         "phone": "03258180307",
//                         "picUrl": "https://ia601307.us.archive.org/1/items/instagram-plain-round/instagram%20dip%20in%20hair.jpg",
//                         "status": "active",
//                         "joinDate": "2025-07-31",
//                         "points": 32
//                     },
//                     {
//                         "id": "user_30uAyOHOCGaMzRJDwx1m0e7fFqc",
//                         "name": "Worker White",
//                         "role": "3",
//                         "email": "theamzthesecretone@gmail.com",
//                         "phone": "03221751659",
//                         "picUrl": "https://res.cloudinary.com/ddrcc3pf0/image/upload/v1754467403/profile_pictures/jgvjqafu5gi698puninn.jpg",
//                         "status": "busy",
//                         "joinDate": "2025-08-06",
//                         "points": 0
//                     }
//                 ]
//             },
//             {
//                 "id": 4,
//                 "name": "Hardware Support",
//                 "description": "Takes care of physical devices, replacements, and hardware diagnostics.",
//                 "status": "active",
//                 "createdDate": "2025-07-14",
//                 "manager": null,
//                 "members": []
//             },
//             {
//                 "id": 5,
//                 "name": "Other ICT Services",
//                 "description": "Covers all other ICT-related assistance not falling under major categories.",
//                 "status": "active",
//                 "createdDate": "2025-07-14",
//                 "manager": null,
//                 "members": []
//             }
//         ]
//     },
//     "success": true,
//     "message": "Team hierarchy fetched successfully"
// }

const privilegesSchema = z.record(z.unknown());
export type Privileges = z.infer<typeof privilegesSchema>;
export const managerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  picUrl: z.string().url().nullable(),
  privileges: privilegesSchema.optional()
});
export type Manager = z.infer<typeof managerSchema>;
export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  picUrl: z.string().url().nullable(),
  status: teamWorkerStatusEnum,
  joinDate: z.string().date(),
  points: z.number()
});
export type Member = z.infer<typeof memberSchema>;
export const teamSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  createdDate: z.string().date(),
  manager: managerSchema.nullable(),
  members: z.array(memberSchema).optional().default([]),
});
export type Team = z.infer<typeof teamSchema>;



export const getTeamHierarchyDataSchema = z.object({
  teams: z.array(teamSchema),
});

export const getTeamHierarchyResponseSchema = responseSchema(getTeamHierarchyDataSchema);
