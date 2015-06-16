# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'Tips',
    'category': 'Usability',
    'description': """
OpenERP Web tips.
========================

""",
    'version': '0.1',
    'author': 'OpenERP SA',
    'depends': ['web'],
    'data': [
        'security/ir.model.access.csv',
        'views/tip.xml',
        'web_tip_view.xml'
    ],
    'auto_install': True
}
