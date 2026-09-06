import { describe, expect, it, vi } from 'vitest';
import type { FormSchema } from '@dynamic-form-engine/core';
import { addWizardStep, duplicateWizardStep, moveFieldToStep, moveWizardStep, removeWizardStep, updateWizardStep, wizardConfig } from './wizard';
const schema:FormSchema={id:'test',fields:[{name:'name',type:'text'},{name:'email',type:'email'}]};
describe('wizard model',()=>{it('manages steps and field assignments',()=>{vi.spyOn(Date,'now').mockReturnValueOnce(10).mockReturnValueOnce(11);let c=addWizardStep(wizardConfig(schema));c=updateWizardStep(c,'step-10',{title:'Contact'});c=moveFieldToStep(c,'email','step-10');expect(c.steps.map(s=>[s.title,s.fieldPaths])).toEqual([['Form details',['name']],['Contact',['email']]]);c=moveWizardStep(c,'step-10',-1);c=duplicateWizardStep(c,'step-10');expect(c.steps[0].title).toBe('Contact');expect(removeWizardStep(c,'step-10').steps).toHaveLength(2);});});

