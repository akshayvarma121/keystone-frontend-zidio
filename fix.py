import os
import re
import glob

def replace_in_file(path, pattern, repl):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(pattern, repl, content, flags=re.DOTALL)
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched {path}")

def main():
    # 1. Remove all mock/data imports across all tsx files
    for filepath in glob.glob('d:/ZIDIO/frontend/keystone/src/**/*.tsx', recursive=True):
        # We just remove getCustomer, getSite, etc from imports
        replace_in_file(filepath, r"import\s*\{\s*getCustomer,\s*getSite\s*\}\s*from\s*['\"](\.\./)*mock/data['\"];?\n*", "")
        replace_in_file(filepath, r"import\s*\{\s*getCustomer,\s*getSite,\s*getTechnician\s*\}\s*from\s*['\"](\.\./)*mock/data['\"];?\n*", "")
        replace_in_file(filepath, r"import\s*\{\s*getCustomer,\s*getSite,\s*getTechnician,\s*inventory\s*\}\s*from\s*['\"](\.\./)*mock/data['\"];?\n*", "")
        replace_in_file(filepath, r"import\s*\{\s*customers,\s*sites\s*\}\s*from\s*['\"](\.\./)*mock/data['\"];?\n*", "")
        replace_in_file(filepath, r"import\s*\{\s*getSite\s*\}\s*from\s*['\"](\.\./)*mock/data['\"];?\n*", "")

    # CustomerPortalView.tsx
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/customer/CustomerPortalView.tsx', r"const customer = currentCustomerRecord\(user\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/customer/CustomerPortalView.tsx', r"\{customer\?\.name\}", "{user.name}")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/customer/CustomerPortalView.tsx', r"const site = getSite\(wo\.siteId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/customer/CustomerPortalView.tsx', r"\{site\?\.name\}", "{wo.siteName}")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/customer/CustomerPortalView.tsx', r"import\s*\{\s*useAuth,\s*currentCustomerRecord\s*\}\s*from\s*['\"](\.\./)*context/AuthContext['\"];", "import { useAuth } from '../../context/AuthContext';")

    # DispatchView.tsx
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/dispatch/DispatchView.tsx', r"const customer = getCustomer\(wo\.customerId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/dispatch/DispatchView.tsx', r"const site = getSite\(wo\.siteId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/dispatch/DispatchView.tsx', r"\{customer\?\.name\}", "{wo.customerName}")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/dispatch/DispatchView.tsx', r"\{site\?\.city\}", "{wo.siteName}")

    # TechnicianMobileView.tsx
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/technician/TechnicianMobileView.tsx', r"import\s*\{\s*useAuth,\s*currentTechnicianRecord\s*\}\s*from\s*['\"](\.\./)*context/AuthContext['\"];", "import { useAuth } from '../../context/AuthContext';")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/technician/TechnicianMobileView.tsx', r"const tech = currentTechnicianRecord\(user\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/technician/TechnicianMobileView.tsx', r"const customer = getCustomer\(wo\.customerId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/technician/TechnicianMobileView.tsx', r"const site = getSite\(wo\.siteId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/technician/TechnicianMobileView.tsx', r"\{customer\?\.name\}", "{wo.customerName}")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/technician/TechnicianMobileView.tsx', r"\{site\?\.addressLine\},\s*\{wo\.siteName\},\s*\{site\?\.state\}", "{wo.siteName}")

    # KanbanBoard.tsx
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/KanbanBoard.tsx', r"const customer = getCustomer\(wo\.customerId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/KanbanBoard.tsx', r"const site = getSite\(wo\.siteId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/KanbanBoard.tsx', r"const tech = getTechnician\(wo\.assignedTechnicianId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/KanbanBoard.tsx', r"\{customer\?\.name\}", "{wo.customerName}")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/KanbanBoard.tsx', r"\{site\?\.city\}", "{wo.siteName}")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/KanbanBoard.tsx', r"\{tech && \(", "{wo.assignedTechnicianName && (")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/KanbanBoard.tsx', r"\{tech\.name\}", "{wo.assignedTechnicianName}")

    # WorkOrderDetailModal.tsx
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"import\s*\{\s*useAuth,\s*currentTechnicianRecord\s*\}\s*from\s*['\"](\.\./)*context/AuthContext['\"];", "import { useAuth } from '../../context/AuthContext';")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"const techName = currentTechnicianRecord\(user\)\?\.name \?\? getTechnician\(wo\?\.assignedTechnicianId \?\? null\)\?\.name \?\? user\.name;", "const techName = wo?.assignedTechnicianName ?? user.name;")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"const customer = getCustomer\(wo\.customerId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"const site = getSite\(wo\.siteId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"const tech = getTechnician\(wo\.assignedTechnicianId\);", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"\{customer\?\.name \?\? '—'\}", "{wo?.customerName ?? '—'}")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"\{site\?\.addressLine\}", "")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"\{site\?\.city\},\s*\{site\?\.state\}\s*\{site\?\.zipCode\}", "{wo?.siteName}")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"\{tech\?\.name \?\? 'Unassigned'\}", "{wo?.assignedTechnicianName ?? 'Unassigned'}")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderDetailModal.tsx', r"inventory\.map", "([].map as any)")

    # WorkOrderFormModal.tsx
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderFormModal.tsx', r"import\s*\{\s*useAuth,\s*currentCustomerRecord\s*\}\s*from\s*['\"](\.\./)*context/AuthContext['\"];", "import { useAuth } from '../../context/AuthContext';")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderFormModal.tsx', r"const customer = currentCustomerRecord\(user\);", "const customer = { id: user.customerId, name: user.name };")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderFormModal.tsx', r"sites\.filter", "([].filter as any)")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderFormModal.tsx', r"sites\.map", "([].map as any)")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderFormModal.tsx', r"customers\.map", "([].map as any)")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/components/workorders/WorkOrderFormModal.tsx', r"sites\.find", "([].find as any)")

    # ProfilePage.tsx
    replace_in_file('d:/ZIDIO/frontend/keystone/src/pages/ProfilePage.tsx', r"import\s*\{\s*useAuth,\s*currentTechnicianRecord,\s*currentCustomerRecord\s*\}\s*from\s*['\"](\.\./)*context/AuthContext['\"];", "import { useAuth } from '../context/AuthContext';")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/pages/ProfilePage.tsx', r"const tech = currentTechnicianRecord\(user\);", "const tech = { id: user.technicianId, name: user.name };")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/pages/ProfilePage.tsx', r"const customer = currentCustomerRecord\(user\);", "const customer = { id: user.customerId, name: user.name };")
    replace_in_file('d:/ZIDIO/frontend/keystone/src/pages/ProfilePage.tsx', r"\(skill\)", "(skill: any)")

if __name__ == '__main__':
    main()
