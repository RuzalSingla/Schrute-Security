import ModuleLearning from '@/components/module-learning';

export default async function TrainingModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  return <ModuleLearning moduleId={moduleId} />;
}
