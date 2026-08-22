import {
  FormProvider,
  useForm,
  useField
} from "@dynamic-forms/react";

import {
  MuiForm
} from "@dynamic-forms/mui";

import {
  Box,
  Paper,
  Typography
} from "@mui/material";

import { QuickstartExample } from "./examples/QuickstartExample";

import type {
  FormSchema
} from "@dynamic-forms/core";


export const schema: FormSchema = {
  id: "complete-mui-form",

  fields: [
    // =========================================================
    // 1. CORE INPUT CONTROLS
    // =========================================================

    {
      name: "name",
      type: "text",
      label: "Name",
      placeholder: "Enter your name",
      validation: {
        required: true,
        minLength: 3,
        maxLength: 100,
      },
    },

    {
      name: "description",
      type: "textarea",
      label: "Description",
      placeholder: "Tell us about yourself",
      validation: {
        maxLength: 500,
      },
    },

    {
      name: "password",
      type: "password",
      label: "Password",
      placeholder: "Enter your password",
      validation: {
        required: true,
        minLength: 8,
      },
    },

    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email",
      validation: {
        required: true,
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      },
    },

    // {
    //   name: "website",
    //   type: "url",
    //   label: "Website",
    //   placeholder: "https://example.com",
    // },

    {
      name: "age",
      type: "number",
      label: "Age",
      placeholder: "Enter your age",
      validation: {
        required: true,
        min: 18,
        max: 100,
      },
    },

    {
      name: "employeeCount",
      type: "number",
      label: "Employee Count",
      placeholder: "Enter employee count",
      validation: {
        min: 1,
        max: 100000,
      },
    },

    {
      name: "salary",
      type: "number",
      label: "Salary",
      placeholder: "Enter salary",
      validation: {
        min: 0,
      },
    },

    // {
    //   name: "internalId",
    //   type: "hidden",
    //   defaultValue: "EMP-001",
    // },

    // =========================================================
    // 2. SELECTION CONTROLS
    // =========================================================

    {
      name: "country",
      type: "select",
      label: "Country",
      placeholder: "Select country",
      options: [
        {
          label: "India",
          value: "IN",
        },
        {
          label: "United States",
          value: "US",
        },
        {
          label: "United Kingdom",
          value: "UK",
        },
      ],
      validation: {
        required: true,
      },
    },

    // {
    //   name: "skills",
    //   type: "multi-select",
    //   label: "Skills",
    //   placeholder: "Select skills",
    //   options: [
    //     {
    //       label: "TypeScript",
    //       value: "typescript",
    //     },
    //     {
    //       label: "React",
    //       value: "react",
    //     },
    //     {
    //       label: "Angular",
    //       value: "angular",
    //     },
    //     {
    //       label: "Node.js",
    //       value: "node",
    //     },
    //   ],
    // },

    {
      name: "framework",
      type: "autocomplete",
      label: "Primary Framework",
      placeholder: "Search framework",
      options: [
        {
          label: "React",
          value: "react",
        },
        {
          label: "Angular",
          value: "angular",
        },
        {
          label: "Vue",
          value: "vue",
        },
      ],
    },

    {
      name: "technology",
      type: "async-autocomplete",
      label: "Technology",
      placeholder: "Search technology",
    },

    {
      name: "languages",
      type: "checkbox-group",
      label: "Languages",
      options: [
        {
          label: "English",
          value: "english",
        },
        {
          label: "Tamil",
          value: "tamil",
        },
        {
          label: "Hindi",
          value: "hindi",
        },
      ],
    },

    {
      name: "gender",
      type: "radio",
      label: "Gender",
      options: [
        {
          label: "Male",
          value: "male",
        },
        {
          label: "Female",
          value: "female",
        },
        {
          label: "Other",
          value: "other",
        },
      ],
      validation: {
        required: true,
      },
    },

    {
      name: "department",
      type: "radio-group",
      label: "Department",
      options: [
        {
          label: "Engineering",
          value: "engineering",
        },
        {
          label: "Sales",
          value: "sales",
        },
        {
          label: "HR",
          value: "hr",
        },
      ],
    },

    {
      name: "notifications",
      type: "switch",
      label: "Enable Notifications",
    },

    {
      name: "accountType",
      type: "toggle-button-group",
      label: "Account Type",
      options: [
        {
          label: "Personal",
          value: "personal",
        },
        {
          label: "Business",
          value: "business",
        },
      ],
    },

    {
      name: "category",
      type: "tree-select",
      label: "Category",
      placeholder: "Select category",
      options: [
        {
          label: "Technology",
          value: "technology",
          children: [
            {
              label: "Frontend",
              value: "frontend",
            },
            {
              label: "Backend",
              value: "backend",
            },
          ],
        },
        {
          label: "Business",
          value: "business",
          children: [
            {
              label: "Finance",
              value: "finance",
            },
            {
              label: "Marketing",
              value: "marketing",
            },
          ],
        },
      ],
    },

    // =========================================================
    // 3. DATE & TIME CONTROLS
    // =========================================================

    {
      name: "birthDate",
      type: "date",
      label: "Date of Birth",
      validation: {
        required: true,
      },
    },

    {
      name: "startTime",
      type: "time",
      label: "Start Time",
    },

    {
      name: "appointment",
      type: "datetime",
      label: "Appointment",
    },

    {
      name: "vacation",
      type: "date-range",
      label: "Vacation Period",
    },

    {
      name: "workingHours",
      type: "time-range",
      label: "Working Hours",
    },

    {
      name: "eventPeriod",
      type: "datetime-range",
      label: "Event Period",
    },

    {
      name: "joiningMonth",
      type: "month",
      label: "Joining Month",
    },

    {
      name: "joiningYear",
      type: "year",
      label: "Joining Year",
    },

    // =========================================================
    // 4. SPECIALIZED NUMERIC CONTROLS
    // =========================================================

    {
      name: "price",
      type: "currency",
      label: "Price",
      config: { currency: "INR", locale: "en-IN" },
      validation: {
        min: 0,
      },
    },

    {
      name: "discount",
      type: "percentage",
      label: "Discount",
      config: { min: 0, max: 100, step: 0.5 },
    },

    {
      name: "experience",
      type: "slider",
      label: "Experience",
      config: { min: 0, max: 30, step: 1, marks: true, valueLabelDisplay: "auto" },
    },

    {
      name: "priceRange",
      type: "range-slider",
      label: "Price Range",
      config: { min: 0, max: 100000, step: 1000, marks: true, valueLabelDisplay: "auto" },
    },

    {
      name: "rating",
      type: "rating",
      label: "Rating",
      config: { max: 5, precision: 0.5 },
    },

    {
      name: "phone",
      type: "phone",
      label: "Phone Number",
      config: { defaultCountryCode: "+91" },
      validation: {
        required: true,
      },
    },

    {
      name: "otp",
      type: "otp",
      label: "Verification Code",
      config: { length: 6 },
      validation: {
        required: true,
      },
    },

    {
      name: "pin",
      type: "pin",
      label: "PIN",
      config: { length: 4, mask: true },
    },

    {
      name: "employeeCode",
      type: "mask",
      label: "Employee Code",
      config: { mask: "AA-0000" },
    },

    // =========================================================
    // TERMS
    // =========================================================

    {
      name: "terms",
      type: "checkbox",
      label: "I agree to the terms and conditions",
      validation: {
        required: true,
      },
    },
  ],
};

function ValuesPreview() {
  const name = useField<string>("name");
  const email = useField<string>("email");
  const password = useField<string>("password");
  const age = useField<number | "">("age");
  const bio = useField<string>("bio");
  const country = useField<string>("country");
  const gender = useField<string>("gender");
  const terms = useField<boolean>("terms");
  const birthDate = useField<string>("birthDate");

  const values = {
    name: name.value ?? "",
    email: email.value ?? "",
    password: password.value ?? "",
    age: age.value ?? "",
    bio: bio.value ?? "",
    country: country.value ?? "",
    gender: gender.value ?? "",
    terms: terms.value ?? false,
    birthDate: birthDate.value ?? ""
  };

  return (
    <Box
      component="pre"
      sx={{
        mt: 3,
        p: 2,
        backgroundColor: "grey.100",
        borderRadius: 1,
        overflow: "auto"
      }}
    >
      {JSON.stringify(values, null, 2)}
    </Box>
  );
}

function FormDemo() {
  const { store, registry } = useForm();

  return (
    <FormProvider
      store={store}
      registry={registry}
      schema={schema}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 700,
          mx: "auto",
          my: 5,
          p: 4
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 3 }}
        >
          Dynamic MUI Form
        </Typography>

        <MuiForm
          schema={schema}
          onSubmit={(values) => {
            console.log(
              "FORM SUBMITTED:",
              values
            );
          }}
        />

        <ValuesPreview />
      </Paper>
    </FormProvider>
  );
}

export default function App() {
  if (new URLSearchParams(window.location.search).get("example") === "quickstart") {
    return <QuickstartExample />;
  }
  return <FormDemo />;
}