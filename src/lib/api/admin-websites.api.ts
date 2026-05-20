import { apiGet, apiPost } from '@/lib/api/client';
import type { CreateWebsiteDto } from '@/lib/schemas/website.schema';
import type { Website } from '@/lib/types';

/** Body for POST /websites when authenticated as SUPER_ADMIN (companyId required). */
export interface SuperAdminCreateWebsiteBody {
  companyId: string;
  url: string;
  isActive: boolean;
  label?: string;
}

function toSuperAdminCreateWebsiteBody(companyId: string, dto: CreateWebsiteDto): SuperAdminCreateWebsiteBody {
  const url = dto.url.trim();
  const isActive = dto.isActive ?? true;
  const body: SuperAdminCreateWebsiteBody = { companyId, url, isActive };
  const label = dto.label;
  if (label != null && String(label).trim().length > 0) {
    body.label = String(label).trim();
  }
  return body;
}

/**
 * Lists websites for a tenant. Uses GET /websites with companyId; response is filtered to that company
 * in case the API returns a broader list.
 */
export async function getAdminCompanyWebsites(companyId: string): Promise<Website[]> {
  const rows = await apiGet<Website[]>('/websites', {
    params: { companyId },
  });
  return rows.filter((w) => w.companyId === companyId);
}

/**
 * SUPER_ADMIN: POST /websites with flat JSON { companyId, url, label?, isActive? } (no /admin/companies/... path).
 */
export async function adminCreateCompanyWebsite(
  companyId: string,
  dto: CreateWebsiteDto,
): Promise<Website> {
  return apiPost<Website, SuperAdminCreateWebsiteBody>(
    '/websites',
    toSuperAdminCreateWebsiteBody(companyId, dto),
  );
}
