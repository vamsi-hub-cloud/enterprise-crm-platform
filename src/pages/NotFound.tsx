import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return <div className="card"><EmptyState icon={Compass} title="Page not found" text="That address doesn’t match anything in the CRM." action={<Link to="/"><Button>Back to dashboard</Button></Link>} /></div>;
}
