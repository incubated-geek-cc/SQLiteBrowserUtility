SELECT patient_id,diagnosis_code,icd9_description
 FROM
 (SELECT
 	patient_id,
 	diagnosis_code
 FROM patient_diagnosis) A LEFT JOIN 
 (SELECT icd9_code, icd9_description FROM icd9_mapping) B
 ON A.diagnosis_code = B.icd9_code;