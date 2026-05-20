'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClientContact } from '@/lib/types';
import { contactSourceLabel, formatDate, fullName } from '@/lib/utils/format';

interface ContactDetailProps {
  contact: ClientContact;
}

export function ContactDetail({ contact }: ContactDetailProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{fullName(contact)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          <span className="text-text-secondary">Email:</span> {contact.email ?? '—'}
        </p>
        <p>
          <span className="text-text-secondary">Phone:</span> {contact.phone ?? '—'}
        </p>
        <p>
          <span className="text-text-secondary">Source:</span> {contactSourceLabel(contact.source)}
        </p>
        <p>
          <span className="text-text-secondary">Created:</span> {formatDate(contact.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
}
