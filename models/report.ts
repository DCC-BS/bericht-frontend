import { createComplaint, type ComplaintDto, type IComplaint } from "./complaint";

export interface IReport {
    readonly id: string;
    name: string;
    subtitle1: string;
    subtitle2: string;

    readonly createdAt: Date;
    readonly lastModified: Date;

    readonly complaints: readonly IComplaint[];

    addComplaint(complaint: IComplaint): void;
    removeComplaint(complaintId: string): void;

    toDto(): ReportDto;
}

export type ReportDto = {
    id: string;
    name: string;
    subtitle1: string;
    subtitle2: string;
    createdAt: Date;
    lastModified: Date;
    complaints: ComplaintDto[];
}

export function createReport(dto: Partial<ReportDto>): IReport {
    return new Report(dto);
}

class Report implements IReport {
    readonly id: string;
    readonly createdAt: Date;
    complaints: IComplaint[];
    subtitle1: string;
    subtitle2: string;

    private _name: string;
    lastModified: Date;

    constructor(dto: Partial<ReportDto>) {
        this.id = dto.id ?? generateUUID();
        this.createdAt = dto.createdAt ?? new Date();
        this.subtitle1 = dto.subtitle1 ?? '';
        this.subtitle2 = dto.subtitle2 ?? '';
        this._name = dto.name ?? `New Report ${this.createdAt.toLocaleString()}`;
        this.lastModified = dto.lastModified ?? new Date();
        this.complaints = dto.complaints?.map(c => createComplaint(c)) ?? [];
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
        this.lastModified = new Date();
    }

    addComplaint(complaint: IComplaint): void {
        this.complaints.push(complaint);
        this.lastModified = new Date();
    }

    removeComplaint(complaintId: string): void {
        this.complaints = this.complaints.filter(
            (complaint) => complaint.id !== complaintId,
        );
        this.lastModified = new Date();
    }

    toDto(): ReportDto {
        return {
            id: this.id,
            name: this.name,
            subtitle1: this.subtitle1,
            subtitle2: this.subtitle2,
            createdAt: this.createdAt,
            lastModified: this.lastModified,
            complaints: this.complaints.map((complaint) => complaint.toDto()),
        };
    }
}