# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Italy - Accounting',
    'version': '0.2',
    'depends': [
        'account',
        'base_iban',
        'base_vat',
    ],
    'author': 'OpenERP Italian Community',
    'description': """
Piano dei conti italiano di un'impresa generica.
================================================

Italian accounting chart and localization.
    """,
    'category': 'Accounting/Localizations/Account Charts',
    'website': 'http://www.odoo.com/',
    'data': [
        'data/account_chart_template.xml',
        'data/account.account.template.csv',
        'data/account_chart_template_accounts.xml',
        'data/account.tax.group.csv',
        'data/account_tax_template.xml',
        'data/account.fiscal.position.template.csv',
        'data/account_chart_template_data.xml',
    ],
    'demo': [
        'demo/demo_company.xml',
    ],
    'license': 'LGPL-3',
}
