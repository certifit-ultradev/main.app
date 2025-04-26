"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from 'react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className="inline-flex items-center">
                            {index !== 0 && (
                                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                            )}
                            {isLast || !item.href ? (
                                <span className="text-sm font-medium text-gray-500">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="ml-1 text-sm font-medium text-gray-700 hover:text-gray-900 md:ml-2"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export function isLikelyID(seg: string): boolean {
    return /\d/.test(seg);
}

export function getSegmentName(segment: string): string {
    const mappings: Record<string, string> = {
        admin: "Inicio",
        users: "Usuarios",
        categories: "Categorías",
        create: "Crear",
        edit: "Editar",
        view: "Ver",
        dashboard: "Inicio",
        "change-password": "Cambiar contraseña",
        courses: "Cursos",
    };

    return mappings[segment] ?? segment;
}

export function fixRoute(segment: string): string {
    if (segment === "courses") {
        return "";
    }
    return segment;
}

