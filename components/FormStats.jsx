"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

// Overview-card-only label override: the Score Card form's website name
// reads "Africa Creator Score Card" here so it's distinguishable from the
// Wait List form's card, even though both share the same websiteName
// ("Africa Creator Report") everywhere else (sidebar, detail view, config).
const overviewLabelOverrides = {
	"website-b-form-1": "Africa Creator Score Card",
};

export function FormStats({ forms, onSelectForm }) {
	return (
        <>
            {forms.map((form) => (
				<FormStatCard key={form.formId} form={form} onSelect={() => onSelectForm(form.formId)} />
			))}
        </>
    );
}

function FormStatCard({ form, onSelect }) {
	const websiteLabel = overviewLabelOverrides[form.formId] ?? form.websiteName;

	if (form.error) {
		return (
            <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader>
					<CardTitle className="font-normal text-muted-foreground text-xs">
						{websiteLabel}
					</CardTitle>
				</CardHeader>
                <CardContent>
					<p className="font-semibold text-2xl text-destructive tabular-nums">—</p>
				</CardContent>
                <CardFooter className="text-destructive text-xs">
					Couldn&rsquo;t load {form.formName}. Retry, or check back in a few minutes.
				</CardFooter>
            </Card>
        );
	}

	return (
        <button className="cursor-pointer text-left" onClick={onSelect}>
            <Card className="min-h-[140px] bg-primary text-primary-foreground transition hover:opacity-90">
                <CardHeader>
					<CardTitle className="font-normal text-[14px] text-primary-foreground/70">
						{websiteLabel}
					</CardTitle>
					<p className="mt-1 font-medium text-[20px] text-primary-foreground">Total Downloads</p>
				</CardHeader>
                <CardContent className="mt-2">
					<p className="text-balance font-semibold text-[40px] text-[color:var(--color-secondary)] tabular-nums tracking-tight">
						{form.signups ?? 0}
					</p>
				</CardContent>
            </Card>
        </button>
    );
}
