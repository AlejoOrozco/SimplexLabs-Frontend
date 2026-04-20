import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { CreateCompanyDto, UpdateCompanyDto } from '@/lib/schemas/company.schema';
import type { Company } from '@/lib/types';

export async function getCompanies(): Promise<Company[]> {
  return apiGet<Company[]>('/companies');
}

export async function getCompany(id: string): Promise<Company> {
  return apiGet<Company>(`/companies/${id}`);
}

export async function createCompany(dto: CreateCompanyDto): Promise<Company> {
  return apiPost<Company, CreateCompanyDto>('/companies', dto);
}

export async function updateCompany(id: string, dto: UpdateCompanyDto): Promise<Company> {
  return apiPut<Company, UpdateCompanyDto>(`/companies/${id}`, dto);
}

export async function deleteCompany(id: string): Promise<void> {
  await apiDelete<void>(`/companies/${id}`);
}
