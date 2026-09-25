import React from 'react';
import { Dialog } from '../../components/ui/Dialog';
import { PatientForm } from '../../components/patients/PatientForm';
import { patientSchema, PatientFormData, PatientFormValues } from '../../lib/validations/patient';
import { useCreatePatient, useUpdatePatient } from '../../hooks/useHospitalQueries';
import { Patient } from '../../types';

export { patientSchema };
export type { PatientFormData, PatientFormValues };

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  patientToEdit,
}) => {
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const handleSubmit = async (data: PatientFormData) => {
    const payload = data as unknown as Partial<Patient>;
    if (patientToEdit) {
      await updateMutation.mutateAsync({ id: patientToEdit.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={patientToEdit ? `Edit Patient — ${patientToEdit.patient_id}` : 'Register New Patient'}
      description="Enter patient demographics, contact channels, clinical allergies, and emergency contact details."
      maxWidth="3xl"
    >
      <PatientForm
        initialData={patientToEdit}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isSaving}
        submitText={patientToEdit ? 'Save Changes' : 'Register Patient'}
      />
    </Dialog>
  );
};
