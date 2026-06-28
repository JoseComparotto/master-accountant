import z from "zod";
import {
    PatchAccountInputSchema,
    CreateAccountInputSchema
} from "../accounts/accounts.schema.js";
import { JsonPatchOperation } from "../shared/json-patch.schema.js";

const UuidSchema = z.string().uuid();
const UuidOrDashSchema = UuidSchema.or(z.literal('-'));
type Uuid = z.infer<typeof UuidSchema>;
type UuidOrDash = z.infer<typeof UuidOrDashSchema>;

const PatchAccountAttributeSchema = PatchAccountInputSchema.keyof();
type PatchAccountAttribute = z.infer<typeof PatchAccountAttributeSchema>;

type NewAccountPath = `/accounts/${UuidOrDash}`;
const NewAccountPathSchema = z.custom<NewAccountPath>((val) => {
    if (typeof val !== 'string') return false;
    const idPart = val.replace('/accounts/', '');
    return val.startsWith('/accounts/') && UuidOrDashSchema.safeParse(idPart).success;
}).openapi({
    example: '/accounts/-' 
});

type AttributeAccountPath = `/accounts/${Uuid}/${PatchAccountAttribute}`;
const AttributeAccountPathSchema = (reqAttr: PatchAccountAttribute) => z.custom<AttributeAccountPath>((val) => {
    if (typeof val !== 'string') return false;

    const parts = val.split('/'); // Ex: ['', 'accounts', '9b1deb4d...', 'email']

    if (parts.length !== 4 || parts[1] !== 'accounts') return false;
    const [, , uuid, attr] = parts;

    const isUuidValid = UuidSchema.safeParse(uuid).success;
    const isAttrValid = attr === reqAttr;
    return isUuidValid && isAttrValid;
}).openapi({
    example: `/accounts/6e781555-ae0c-4e0b-9603-988cde29bdd4/${reqAttr}`
});

const CreateOperationSchema = z.object({
    op: z.literal('add'),
    path: NewAccountPathSchema,
    value: CreateAccountInputSchema
});

export const ReplaceAccoutAttrSchema = (attr: PatchAccountAttribute) => z.object({
    op: z.literal('replace'),
    path: AttributeAccountPathSchema(attr),
    value: PatchAccountInputSchema.shape[attr]
});

export const CoaPatchOperationSchema = z.union([
    CreateOperationSchema,
    ReplaceAccoutAttrSchema('name'),
    ReplaceAccoutAttrSchema('description'),
    ReplaceAccoutAttrSchema('isContra'),
    ReplaceAccoutAttrSchema('isActive'),
]) satisfies z.ZodType<JsonPatchOperation>;

export type CoaPatchOperation = z.infer<typeof CoaPatchOperationSchema>;
